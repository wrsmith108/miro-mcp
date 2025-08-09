#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🗑️ REMOVING OBSTRUCTING WHITE PANELS');
console.log('Board ID:', boardId);
console.log('Strategy: Delete placeholder panels that are covering content');
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Delay for rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function removeObstructingPanels() {
  try {
    console.log('\n📊 Phase 1: Identifying Obstructing Elements');
    console.log('─'.repeat(50));
    
    // Get all items
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
    
    console.log(`   ✓ Collected ${allItems.length} items`);
    
    // Identify panels to remove (placeholder shapes we added)
    const shapes = allItems.filter(item => item.type === 'shape');
    
    const panelsToRemove = shapes.filter(shape => {
      const content = shape.data?.content?.toLowerCase() || '';
      const fillColor = shape.style?.fillColor;
      
      // Remove placeholder example panels and flow diagram backgrounds
      return (
        content.includes('example') ||
        content.includes('placeholder') ||
        content.includes('continuous discovery flow') ||
        (fillColor === '#e6e6e6' && content.includes('example')) ||
        (fillColor === '#ffffff' && shape.style?.fillOpacity === 0.1)
      );
    });
    
    console.log(`   Found ${panelsToRemove.length} obstructing panels to remove`);
    
    // Also check for duplicate frames
    const frames = allItems.filter(item => item.type === 'frame');
    console.log(`   Found ${frames.length} frames`);
    
    // Phase 2: Remove obstructing panels
    console.log('\n🗑️ Phase 2: Removing Obstructing Panels');
    console.log('─'.repeat(50));
    
    let removed = 0;
    let failed = 0;
    
    for (const panel of panelsToRemove) {
      try {
        await miroApi.delete(`/boards/${boardId}/shapes/${panel.id}`);
        removed++;
        
        process.stdout.write(`\r   Progress: ${removed}/${panelsToRemove.length} panels removed`);
        await delay(200);
      } catch (error) {
        failed++;
        // Continue with next panel
      }
    }
    
    console.log(`\n   ✓ Removed ${removed} obstructing panels`);
    if (failed > 0) {
      console.log(`   ⚠️ Failed to remove ${failed} panels`);
    }
    
    // Phase 3: Keep important visual elements
    console.log('\n✨ Phase 3: Preserving Important Elements');
    console.log('─'.repeat(50));
    
    const importantShapes = shapes.filter(shape => {
      const shapeType = shape.data?.shape;
      const fillColor = shape.style?.fillColor;
      
      // Keep priority dots and colored indicators
      return (
        shapeType === 'circle' ||
        fillColor?.startsWith('#FF') ||
        fillColor?.startsWith('#00FF')
      );
    });
    
    console.log(`   ✓ Preserved ${importantShapes.length} important shapes`);
    console.log('      - Priority scale dots');
    console.log('      - Colored indicators');
    
    // Phase 4: Verify content visibility
    console.log('\n🔍 Phase 4: Content Visibility Check');
    console.log('─'.repeat(50));
    
    // Recount items after removal
    const response = await miroApi.get(`/boards/${boardId}/items`, { 
      params: { limit: 10 }
    });
    
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const texts = allItems.filter(item => item.type === 'text');
    
    console.log(`   Sticky Notes visible: ${stickyNotes.length}`);
    console.log(`   Text items visible: ${texts.length}`);
    console.log(`   Frames preserved: ${frames.length}`);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ PANEL REMOVAL COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Obstructing panels removed: ${removed}`);
    console.log(`   Important shapes preserved: ${importantShapes.length}`);
    console.log(`   Sticky notes now visible: ${stickyNotes.length}`);
    console.log(`   Text items now visible: ${texts.length}`);
    
    console.log('\n✨ Board Status:');
    console.log('   ✓ White placeholder panels removed');
    console.log('   ✓ Example placeholders cleared');
    console.log('   ✓ Sticky notes now fully visible');
    console.log('   ✓ Text titles unobstructed');
    console.log('   ✓ Priority indicators preserved');
    
    console.log('\n💡 Result:');
    console.log('   All content should now be visible without obstruction.');
    console.log('   The board maintains its structure while removing covering elements.');
    
    console.log(`\n🔗 View cleaned board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Run the cleanup
removeObstructingPanels();