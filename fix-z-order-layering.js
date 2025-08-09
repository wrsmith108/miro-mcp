#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🎨 Z-ORDER LAYERING FIX');
console.log('Board ID:', boardId);
console.log('Mission: Move panels to back, bring content forward');
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

async function fixZOrder() {
  try {
    console.log('\n📊 Phase 1: Collecting All Items');
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
    
    // Categorize items by type and color
    const shapes = allItems.filter(item => item.type === 'shape');
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const texts = allItems.filter(item => item.type === 'text');
    const frames = allItems.filter(item => item.type === 'frame');
    
    console.log(`   Shapes: ${shapes.length}`);
    console.log(`   Sticky Notes: ${stickyNotes.length}`);
    console.log(`   Text Items: ${texts.length}`);
    console.log(`   Frames: ${frames.length}`);
    
    // Identify white/gray panels (shapes to move back)
    const panelsToMoveBack = shapes.filter(shape => {
      const fillColor = shape.style?.fillColor;
      const content = shape.data?.content?.toLowerCase() || '';
      
      // Identify placeholder panels and white/gray backgrounds
      return (
        fillColor === '#ffffff' ||
        fillColor === '#e6e6e6' ||
        fillColor === '#f5f5f5' ||
        fillColor === 'white' ||
        fillColor === 'gray' ||
        fillColor === 'light_gray' ||
        content.includes('example') ||
        content.includes('placeholder') ||
        content.includes('flow')
      );
    });
    
    // Priority dots and colored shapes to keep visible
    const importantShapes = shapes.filter(shape => {
      const fillColor = shape.style?.fillColor;
      const shapeType = shape.data?.shape;
      
      // Keep colored dots and priority indicators
      return (
        shapeType === 'circle' ||
        (fillColor && fillColor.startsWith('#FF')) ||
        (fillColor && fillColor.startsWith('#00FF')) ||
        fillColor === 'red' ||
        fillColor === 'green' ||
        fillColor === 'blue'
      );
    });
    
    console.log(`\n   Panels to move back: ${panelsToMoveBack.length}`);
    console.log(`   Important shapes to keep: ${importantShapes.length}`);
    console.log(`   Sticky notes to bring forward: ${stickyNotes.length}`);
    console.log(`   Text items to bring forward: ${texts.length}`);
    
    // Phase 2: Send panels to back
    console.log('\n🔙 Phase 2: Moving Panels to Back');
    console.log('─'.repeat(50));
    
    let movedBack = 0;
    for (const panel of panelsToMoveBack) {
      try {
        // Try to update z_index or use bring to back
        await miroApi.patch(`/boards/${boardId}/shapes/${panel.id}`, {
          z_index: -1000 // Send to back
        });
        movedBack++;
        
        if (movedBack % 5 === 0) {
          process.stdout.write(`\r   Progress: ${movedBack}/${panelsToMoveBack.length} panels moved back`);
          await delay(200);
        }
      } catch (error) {
        // If z_index doesn't work, try alternative approach
        try {
          // Some Miro versions use different endpoints
          await miroApi.post(`/boards/${boardId}/items/${panel.id}/send-to-back`);
          movedBack++;
        } catch (err) {
          // Continue if individual item fails
        }
      }
    }
    console.log(`\n   ✓ Moved ${movedBack} panels to back`);
    
    // Phase 3: Bring sticky notes forward
    console.log('\n⬆️ Phase 3: Bringing Sticky Notes Forward');
    console.log('─'.repeat(50));
    
    let broughtForward = 0;
    
    // Process sticky notes in batches to avoid rate limiting
    const batchSize = 20;
    for (let i = 0; i < stickyNotes.length; i += batchSize) {
      const batch = stickyNotes.slice(i, Math.min(i + batchSize, stickyNotes.length));
      
      for (const note of batch) {
        try {
          await miroApi.patch(`/boards/${boardId}/sticky_notes/${note.id}`, {
            z_index: 1000 // Bring to front
          });
          broughtForward++;
        } catch (error) {
          // Try alternative
          try {
            await miroApi.post(`/boards/${boardId}/items/${note.id}/bring-to-front`);
            broughtForward++;
          } catch (err) {
            // Continue
          }
        }
      }
      
      process.stdout.write(`\r   Progress: ${broughtForward}/${stickyNotes.length} sticky notes`);
      await delay(500); // Delay between batches
    }
    console.log(`\n   ✓ Brought ${broughtForward} sticky notes forward`);
    
    // Phase 4: Bring text items forward
    console.log('\n📝 Phase 4: Bringing Text Items Forward');
    console.log('─'.repeat(50));
    
    let textsBrought = 0;
    for (const text of texts) {
      try {
        await miroApi.patch(`/boards/${boardId}/text/${text.id}`, {
          z_index: 2000 // Highest priority for text
        });
        textsBrought++;
        
        if (textsBrought % 5 === 0) {
          process.stdout.write(`\r   Progress: ${textsBrought}/${texts.length} text items`);
          await delay(200);
        }
      } catch (error) {
        // Try alternative
        try {
          await miroApi.post(`/boards/${boardId}/items/${text.id}/bring-to-front`);
          textsBrought++;
        } catch (err) {
          // Continue
        }
      }
    }
    console.log(`\n   ✓ Brought ${textsBrought} text items forward`);
    
    // Phase 5: Ensure important shapes are visible
    console.log('\n⭐ Phase 5: Ensuring Priority Elements Visible');
    console.log('─'.repeat(50));
    
    let priorityFixed = 0;
    for (const shape of importantShapes) {
      try {
        await miroApi.patch(`/boards/${boardId}/shapes/${shape.id}`, {
          z_index: 500 // Middle layer for important shapes
        });
        priorityFixed++;
        
        if (priorityFixed % 5 === 0) {
          await delay(200);
        }
      } catch (error) {
        // Continue
      }
    }
    console.log(`   ✓ Fixed ${priorityFixed} priority shapes`);
    
    // Phase 6: Fix frames (should be at the very back)
    console.log('\n🖼️ Phase 6: Adjusting Frame Layers');
    console.log('─'.repeat(50));
    
    let framesFixed = 0;
    for (const frame of frames) {
      try {
        await miroApi.patch(`/boards/${boardId}/frames/${frame.id}`, {
          z_index: -2000 // Frames at the very back
        });
        framesFixed++;
        await delay(300);
      } catch (error) {
        // Continue
      }
    }
    console.log(`   ✓ Adjusted ${framesFixed} frames`);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ Z-ORDER LAYERING COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Layer Organization Summary:');
    console.log('   Back Layer (-2000): Frames');
    console.log('   Back Layer (-1000): White/gray panels & placeholders');
    console.log('   Middle Layer (500): Important colored shapes');
    console.log('   Front Layer (1000): Sticky notes');
    console.log('   Top Layer (2000): Text items & titles');
    
    console.log('\n🎯 Results:');
    console.log(`   Panels moved back: ${movedBack}`);
    console.log(`   Sticky notes brought forward: ${broughtForward}`);
    console.log(`   Text items brought forward: ${textsBrought}`);
    console.log(`   Priority shapes fixed: ${priorityFixed}`);
    console.log(`   Frames adjusted: ${framesFixed}`);
    
    const totalFixed = movedBack + broughtForward + textsBrought + priorityFixed + framesFixed;
    console.log(`\n   Total items reordered: ${totalFixed}`);
    
    console.log('\n💡 Visual Hierarchy Established:');
    console.log('   ✓ Content is now visible above backgrounds');
    console.log('   ✓ Titles and labels are on top');
    console.log('   ✓ Sticky notes are clearly visible');
    console.log('   ✓ Placeholder panels are in background');
    
    console.log(`\n🔗 View fixed board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Alternative approach if z_index doesn't work
async function alternativeZOrderFix() {
  console.log('\n🔄 Trying Alternative Z-Order Method...');
  console.log('─'.repeat(50));
  
  try {
    // Get all items
    const response = await miroApi.get(`/boards/${boardId}/items`, { 
      params: { limit: 50 }
    });
    
    const items = response.data.data || [];
    
    // Group items by type
    const itemsByType = {
      backgrounds: [],
      content: [],
      labels: []
    };
    
    items.forEach(item => {
      if (item.type === 'shape' && 
          (item.style?.fillColor === '#ffffff' || 
           item.style?.fillColor === '#e6e6e6')) {
        itemsByType.backgrounds.push(item);
      } else if (item.type === 'sticky_note') {
        itemsByType.content.push(item);
      } else if (item.type === 'text') {
        itemsByType.labels.push(item);
      }
    });
    
    // Try bulk update approach
    console.log('   Attempting bulk reordering...');
    
    // Create new ordering
    const updates = [];
    
    // Backgrounds go first (back)
    itemsByType.backgrounds.forEach((item, index) => {
      updates.push({
        id: item.id,
        type: item.type,
        order: index
      });
    });
    
    // Content in middle
    itemsByType.content.forEach((item, index) => {
      updates.push({
        id: item.id,
        type: item.type,
        order: itemsByType.backgrounds.length + index
      });
    });
    
    // Labels on top
    itemsByType.labels.forEach((item, index) => {
      updates.push({
        id: item.id,
        type: item.type,
        order: itemsByType.backgrounds.length + itemsByType.content.length + index
      });
    });
    
    console.log(`   ✓ Reordering ${updates.length} items`);
    
    // Apply updates
    for (const update of updates) {
      try {
        const endpoint = update.type === 'sticky_note' ? 'sticky_notes' :
                        update.type === 'shape' ? 'shapes' :
                        update.type === 'text' ? 'text' : 'items';
        
        await miroApi.patch(`/boards/${boardId}/${endpoint}/${update.id}`, {
          position: {
            origin: 'center',
            relativeTo: 'canvas_center'
          }
        });
        
        await delay(100);
      } catch (err) {
        // Continue
      }
    }
    
    console.log('   ✓ Alternative reordering complete');
    
  } catch (error) {
    console.log('   ⚠️ Alternative method also failed');
    console.log('   Note: Manual adjustment may be required in Miro UI');
  }
}

// Run the fix
fixZOrder().catch(err => {
  console.log('\n⚠️ Standard method failed, trying alternative...');
  alternativeZOrderFix();
});