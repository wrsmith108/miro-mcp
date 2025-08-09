#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🧹 Board Cleanup Agent - Removing Duplicates');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function cleanupDuplicates() {
  try {
    // Step 1: Get all items
    console.log('\n📊 Analyzing board for duplicates...');
    const response = await miroApi.get(`/boards/${boardId}/items`);
    const items = response.data.data || [];
    
    // Step 2: Find duplicate section headers
    const headerTexts = [
      '0. CONTINUOUS DISCOVERY',
      '1. DEFINING OUTCOMES',
      '2. INTERVIEWING',
      '3. MAPPING OPPORTUNITIES',
      '4. ASSESSING & PRIORITIZING',
      '5. SOLUTION STORY MAPPING',
      '6. TESTING ASSUMPTIONS'
    ];
    
    const duplicates = [];
    const seenHeaders = {};
    
    items.forEach(item => {
      if (item.type === 'text' && item.data?.content) {
        const content = item.data.content;
        
        // Check if it's a section header
        const isHeader = headerTexts.some(header => 
          content.includes(header.replace('&', '&amp;'))
        );
        
        if (isHeader) {
          // Extract section number
          const sectionMatch = content.match(/(\d)\./);
          if (sectionMatch) {
            const section = sectionMatch[1];
            if (!seenHeaders[section]) {
              seenHeaders[section] = {
                id: item.id,
                position: item.position
              };
            } else {
              // This is a duplicate
              duplicates.push({
                id: item.id,
                section: section,
                content: content.substring(0, 50)
              });
            }
          }
        }
      }
    });
    
    console.log(`\n🔍 Found ${duplicates.length} duplicate headers to remove`);
    
    if (duplicates.length > 0) {
      console.log('\n🗑️  Removing duplicates...');
      
      for (const dup of duplicates) {
        try {
          await miroApi.delete(`/boards/${boardId}/texts/${dup.id}`);
          console.log(`   ✓ Removed duplicate header for Section ${dup.section}`);
        } catch (error) {
          console.log(`   ✗ Failed to remove ${dup.id}: ${error.message}`);
        }
      }
    }
    
    // Step 3: Find and remove duplicate shapes (header backgrounds)
    console.log('\n🔍 Checking for duplicate header backgrounds...');
    const shapes = items.filter(item => 
      item.type === 'shape' && 
      item.geometry?.width === 1300 &&
      item.geometry?.height === 60
    );
    
    // Group shapes by position (same X coordinate = same section)
    const shapesBySection = {};
    shapes.forEach(shape => {
      const sectionIndex = Math.floor(shape.position.x / 1400);
      if (!shapesBySection[sectionIndex]) {
        shapesBySection[sectionIndex] = [];
      }
      shapesBySection[sectionIndex].push(shape);
    });
    
    let shapeDuplicatesRemoved = 0;
    Object.entries(shapesBySection).forEach(([section, sectionShapes]) => {
      if (sectionShapes.length > 1) {
        // Keep the first, remove the rest
        const toRemove = sectionShapes.slice(1);
        toRemove.forEach(async shape => {
          try {
            await miroApi.delete(`/boards/${boardId}/shapes/${shape.id}`);
            shapeDuplicatesRemoved++;
            console.log(`   ✓ Removed duplicate background for Section ${section}`);
          } catch (error) {
            console.log(`   ✗ Failed to remove shape ${shape.id}`);
          }
        });
      }
    });
    
    // Step 4: Check for overlapping sticky notes
    console.log('\n🔍 Checking for overlapping sticky notes...');
    const stickyNotes = items.filter(item => item.type === 'sticky_note');
    const overlapping = [];
    
    for (let i = 0; i < stickyNotes.length; i++) {
      for (let j = i + 1; j < stickyNotes.length; j++) {
        const note1 = stickyNotes[i];
        const note2 = stickyNotes[j];
        
        // Check if positions are too close (within 50px)
        const distance = Math.sqrt(
          Math.pow(note1.position.x - note2.position.x, 2) +
          Math.pow(note1.position.y - note2.position.y, 2)
        );
        
        if (distance < 50) {
          overlapping.push({
            note1: note1.id,
            note2: note2.id,
            distance: Math.round(distance)
          });
        }
      }
    }
    
    if (overlapping.length > 0) {
      console.log(`   ⚠️  Found ${overlapping.length} overlapping note pairs`);
      console.log('   Consider repositioning these manually');
    } else {
      console.log('   ✓ No overlapping sticky notes found');
    }
    
    // Step 5: Summary
    console.log('\n' + '─'.repeat(50));
    console.log('🎯 Cleanup Summary:');
    console.log(`   ✓ Removed ${duplicates.length} duplicate headers`);
    console.log(`   ✓ Removed ${shapeDuplicatesRemoved} duplicate backgrounds`);
    console.log(`   ✓ Found ${overlapping.length} overlapping notes`);
    console.log(`   ✓ Board is now cleaner and ready for content`);
    
    // Step 6: Final count
    const finalResponse = await miroApi.get(`/boards/${boardId}/items`);
    const finalItems = finalResponse.data.data || [];
    console.log(`\n📊 Final item count: ${finalItems.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run cleanup
cleanupDuplicates();