#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 Comprehensive Board Audit');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function auditBoard() {
  try {
    // Get ALL items with pagination
    let allItems = [];
    let cursor = null;
    let hasMore = true;
    
    while (hasMore) {
      const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      
      allItems = allItems.concat(response.data.data || []);
      
      cursor = response.data.cursor;
      hasMore = !!cursor;
    }
    
    console.log(`\n📊 Total Items Found: ${allItems.length}`);
    
    // Categorize by type
    const itemsByType = {};
    allItems.forEach(item => {
      if (!itemsByType[item.type]) {
        itemsByType[item.type] = [];
      }
      itemsByType[item.type].push(item);
    });
    
    console.log('\n📋 Items by Type:');
    Object.entries(itemsByType).forEach(([type, items]) => {
      console.log(`   ${type}: ${items.length} items`);
    });
    
    // Analyze sticky notes specifically
    if (itemsByType.sticky_note) {
      console.log('\n📝 Sticky Notes Analysis:');
      const stickyColors = {};
      itemsByType.sticky_note.forEach(note => {
        const color = note.style?.fillColor || 'unknown';
        stickyColors[color] = (stickyColors[color] || 0) + 1;
      });
      
      Object.entries(stickyColors).forEach(([color, count]) => {
        console.log(`   ${color}: ${count} notes`);
      });
      
      // Sample content
      console.log('\n📄 Sample Sticky Note Content:');
      itemsByType.sticky_note.slice(0, 5).forEach((note, i) => {
        const content = note.data?.content || '(empty)';
        console.log(`   ${i + 1}. "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
      });
    }
    
    // Analyze position distribution (sections)
    console.log('\n📍 Position Distribution (Section Analysis):');
    const sections = Array(7).fill(0).map(() => ({ items: 0, types: {} }));
    
    allItems.forEach(item => {
      if (item.position) {
        const sectionIndex = Math.floor(item.position.x / 1400);
        if (sectionIndex >= 0 && sectionIndex <= 6) {
          sections[sectionIndex].items++;
          sections[sectionIndex].types[item.type] = (sections[sectionIndex].types[item.type] || 0) + 1;
        }
      }
    });
    
    sections.forEach((section, index) => {
      console.log(`\n   Section ${index}: ${section.items} items`);
      if (section.items > 0) {
        Object.entries(section.types).forEach(([type, count]) => {
          console.log(`      - ${type}: ${count}`);
        });
      }
    });
    
    // Check for section headers (text items)
    console.log('\n📑 Section Headers (Text Items):');
    if (itemsByType.text) {
      itemsByType.text.forEach(text => {
        const content = text.data?.content || '';
        if (content.includes('CONTINUOUS') || content.includes('DEFINING') || 
            content.includes('INTERVIEWING') || content.includes('MAPPING') || 
            content.includes('ASSESSING') || content.includes('STORY') || 
            content.includes('TESTING')) {
          console.log(`   Found: "${content.substring(0, 60)}..."`);
        }
      });
    }
    
    // Check for shapes (backgrounds)
    console.log('\n🔷 Shapes (Backgrounds/Frames):');
    if (itemsByType.shape) {
      itemsByType.shape.forEach(shape => {
        const color = shape.style?.fillColor || 'unknown';
        const width = shape.geometry?.width || 0;
        const height = shape.geometry?.height || 0;
        console.log(`   ${shape.data?.shape || 'rectangle'}: ${width}x${height}, color: ${color}`);
      });
    }
    
    // Summary comparison with expected
    console.log('\n' + '─'.repeat(50));
    console.log('📊 EXPECTED vs ACTUAL COMPARISON:');
    console.log('');
    console.log('Expected from screenshots:');
    console.log('   - Sticky notes: ~471');
    console.log('   - Section headers: 7');
    console.log('   - Examples section: Yes');
    console.log('   - Color distribution: Yellow(308), Purple(108), Green(23), Pink(4), Dark Blue(28)');
    console.log('');
    console.log('Actual on board:');
    console.log(`   - Sticky notes: ${itemsByType.sticky_note ? itemsByType.sticky_note.length : 0}`);
    console.log(`   - Text items: ${itemsByType.text ? itemsByType.text.length : 0}`);
    console.log(`   - Shapes: ${itemsByType.shape ? itemsByType.shape.length : 0}`);
    console.log(`   - Total items: ${allItems.length}`);
    
    // Calculate completion percentage
    const expectedStickies = 471;
    const actualStickies = itemsByType.sticky_note ? itemsByType.sticky_note.length : 0;
    const completionPercent = Math.round((actualStickies / expectedStickies) * 100);
    
    console.log('\n📈 Completion Status:');
    console.log(`   Sticky Notes: ${completionPercent}% complete (${actualStickies}/${expectedStickies})`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

auditBoard();