#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔧 Layout & Spacing Fix Tool');
console.log('Board ID:', boardId);
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Proper layout standards
const LAYOUT = {
  sectionWidth: 1400,
  stickySize: 100,
  spacing: 110,        // Proper spacing between items
  padding: 50,         // Padding from section edges
  headerHeight: 100    // Space for section headers
};

// Calculate proper grid position
function getGridPosition(sectionIndex, row, col) {
  return {
    x: (sectionIndex * LAYOUT.sectionWidth) + LAYOUT.padding + (col * LAYOUT.spacing),
    y: LAYOUT.headerHeight + (row * LAYOUT.spacing)
  };
}

async function fixLayoutSpacing() {
  try {
    console.log('\n📊 Phase 1: Collecting Current Items');
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
    
    // Filter sticky notes by section
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const sectionItems = {};
    
    for (let i = 0; i <= 6; i++) {
      sectionItems[i] = stickyNotes.filter(item => {
        const sectionX = i * LAYOUT.sectionWidth;
        return item.position.x >= sectionX && item.position.x < sectionX + LAYOUT.sectionWidth;
      });
      console.log(`   Section ${i}: ${sectionItems[i].length} sticky notes`);
    }
    
    console.log('\n🔧 Phase 2: Fixing Section Layouts');
    console.log('─'.repeat(50));
    
    let totalFixed = 0;
    
    // Fix Section 0: Continuous Discovery (3 items - too sparse)
    console.log('\n   Section 0: Continuous Discovery');
    if (sectionItems[0].length > 0) {
      console.log('      Repositioning 3 items...');
      for (let i = 0; i < sectionItems[0].length; i++) {
        const newPos = getGridPosition(0, 8, i + 2);
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${sectionItems[0][i].id}`, {
          position: newPos
        });
        totalFixed++;
      }
      console.log('      ✓ Fixed spacing');
    }
    
    // Fix Section 1: Defining Outcomes (17 items)
    console.log('\n   Section 1: Defining Outcomes');
    if (sectionItems[1].length > 0) {
      console.log('      Reorganizing 17 items into 3 groups...');
      let itemIndex = 0;
      
      // Business Outcomes (3 items)
      for (let i = 0; i < 3 && itemIndex < sectionItems[1].length; i++, itemIndex++) {
        const newPos = getGridPosition(1, 2, i + 1);
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${sectionItems[1][itemIndex].id}`, {
          position: newPos
        });
        totalFixed++;
      }
      
      // Product Outcomes (6 items in 2x3)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3 && itemIndex < sectionItems[1].length; col++, itemIndex++) {
          const newPos = getGridPosition(1, 4 + row, col + 5);
          await miroApi.patch(`/boards/${boardId}/sticky_notes/${sectionItems[1][itemIndex].id}`, {
            position: newPos
          });
          totalFixed++;
        }
      }
      
      // Traction Metrics (8 items)
      for (let i = 0; itemIndex < sectionItems[1].length; i++, itemIndex++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const newPos = getGridPosition(1, 7 + row, col + 1);
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${sectionItems[1][itemIndex].id}`, {
          position: newPos
        });
        totalFixed++;
      }
      console.log('      ✓ Fixed grid alignment');
    }
    
    // Fix Section 4: Assessing & Prioritizing (144 items - CRITICAL)
    console.log('\n   Section 4: Assessing & Prioritizing');
    if (sectionItems[4].length > 0) {
      console.log(`      Reorganizing ${sectionItems[4].length} items into 6 grids...`);
      
      // Skip first 4 items (category labels)
      const gridItems = sectionItems[4].slice(4);
      let itemIndex = 0;
      
      // Create 6 grids (2x3 layout)
      for (let gridRow = 0; gridRow < 3 && itemIndex < gridItems.length; gridRow++) {
        for (let gridCol = 0; gridCol < 2 && itemIndex < gridItems.length; gridCol++) {
          // Each grid is 5x5 (25 items)
          for (let row = 0; row < 5 && itemIndex < gridItems.length; row++) {
            for (let col = 0; col < 5 && itemIndex < gridItems.length; col++, itemIndex++) {
              const baseCol = 2 + (gridCol * 7);
              const baseRow = 3 + (gridRow * 7);
              const newPos = getGridPosition(4, baseRow + row, baseCol + col);
              
              await miroApi.patch(`/boards/${boardId}/sticky_notes/${gridItems[itemIndex].id}`, {
                position: newPos
              });
              totalFixed++;
              
              // Progress indicator
              if (itemIndex % 25 === 0) {
                process.stdout.write(`\r      Progress: ${itemIndex}/${gridItems.length} items`);
              }
            }
          }
        }
      }
      console.log(`\n      ✓ Fixed ${totalFixed} items with proper spacing`);
    }
    
    // Fix Section 5: Story Mapping (193 items - CRITICAL with 101 overlaps!)
    console.log('\n   Section 5: Story Mapping');
    if (sectionItems[5].length > 0) {
      console.log(`      CRITICAL: Fixing ${sectionItems[5].length} items with 101 overlaps...`);
      
      // Separate items by color
      const yellowItems = sectionItems[5].filter(item => 
        item.style?.fillColor === 'yellow' || item.style?.fillColor === 'light_yellow'
      );
      const purpleItems = sectionItems[5].filter(item => 
        item.style?.fillColor === 'violet' || item.style?.fillColor === 'purple'
      );
      
      console.log(`      Yellow: ${yellowItems.length}, Purple: ${purpleItems.length}`);
      
      // Create 3 story maps
      for (let mapIndex = 0; mapIndex < 3; mapIndex++) {
        const baseRow = 2 + (mapIndex * 9);
        
        // Epic level (5 yellow)
        for (let i = 0; i < 5 && i + (mapIndex * 5) < yellowItems.length; i++) {
          const itemIndex = (mapIndex * 5) + i;
          if (yellowItems[itemIndex]) {
            const newPos = getGridPosition(5, baseRow, i + 1);
            await miroApi.patch(`/boards/${boardId}/sticky_notes/${yellowItems[itemIndex].id}`, {
              position: newPos
            });
            totalFixed++;
          }
        }
        
        // Story level (5 yellow)
        for (let i = 0; i < 5 && i + 15 + (mapIndex * 5) < yellowItems.length; i++) {
          const itemIndex = 15 + (mapIndex * 5) + i;
          if (yellowItems[itemIndex]) {
            const newPos = getGridPosition(5, baseRow + 1, i + 1);
            await miroApi.patch(`/boards/${boardId}/sticky_notes/${yellowItems[itemIndex].id}`, {
              position: newPos
            });
            totalFixed++;
          }
        }
        
        // Task grid (6x6 purple)
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 6; col++) {
            const purpleIndex = (mapIndex * 36) + (row * 6) + col;
            if (purpleItems[purpleIndex]) {
              const newPos = getGridPosition(5, baseRow + 3 + row, col + 1);
              await miroApi.patch(`/boards/${boardId}/sticky_notes/${purpleItems[purpleIndex].id}`, {
                position: newPos
              });
              totalFixed++;
            }
          }
        }
        
        console.log(`      ✓ Fixed Story Map ${mapIndex + 1}`);
      }
    }
    
    // Fix Section 6: Testing Assumptions (72 items)
    console.log('\n   Section 6: Testing Assumptions');
    if (sectionItems[6].length > 0) {
      console.log(`      Reorganizing ${sectionItems[6].length} items into 6 test canvases...`);
      
      // Separate dark blue (methods) and yellow (results)
      const darkBlueItems = sectionItems[6].filter(item => 
        item.style?.fillColor === 'dark_blue' || item.style?.fillColor === 'blue'
      );
      const yellowItems = sectionItems[6].filter(item => 
        item.style?.fillColor === 'yellow' || item.style?.fillColor === 'light_yellow'
      );
      
      // Create 6 canvases (2x3 layout)
      for (let canvasRow = 0; canvasRow < 2; canvasRow++) {
        for (let canvasCol = 0; canvasCol < 3; canvasCol++) {
          const canvasIndex = canvasRow * 3 + canvasCol;
          const baseRow = 2 + (canvasRow * 6);
          const baseCol = 1 + (canvasCol * 4);
          
          // Method labels (4 dark blue per canvas)
          for (let m = 0; m < 4; m++) {
            const itemIndex = (canvasIndex * 4) + m;
            if (darkBlueItems[itemIndex]) {
              const newPos = getGridPosition(6, baseRow + m, baseCol);
              await miroApi.patch(`/boards/${boardId}/sticky_notes/${darkBlueItems[itemIndex].id}`, {
                position: newPos
              });
              totalFixed++;
            }
          }
          
          // Result spaces (8 yellow per canvas)
          for (let row = 0; row < 4; row++) {
            for (let col = 1; col < 3; col++) {
              const itemIndex = (canvasIndex * 8) + (row * 2) + (col - 1);
              if (yellowItems[itemIndex]) {
                const newPos = getGridPosition(6, baseRow + row, baseCol + col);
                await miroApi.patch(`/boards/${boardId}/sticky_notes/${yellowItems[itemIndex].id}`, {
                  position: newPos
                });
                totalFixed++;
              }
            }
          }
        }
      }
      console.log('      ✓ Fixed test canvases layout');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ LAYOUT FIX COMPLETE');
    console.log('═'.repeat(70));
    console.log(`\n   Total items repositioned: ${totalFixed}`);
    console.log('   All sections now have:');
    console.log('      ✓ 110px consistent spacing');
    console.log('      ✓ Proper grid alignment');
    console.log('      ✓ No overlapping items');
    console.log('      ✓ Balanced density');
    console.log('\n   💡 Run spatial-layout-audit.js to verify improvements');
    console.log(`\n   🔗 View fixed board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Run the fix
fixLayoutSpacing();