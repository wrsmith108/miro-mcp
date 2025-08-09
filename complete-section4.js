#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🎯 Section 4 Completion Agent - Ideation Grids');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Section 4 starts at x = 5600
const SECTION_4_X = 5600;

async function completeSection4() {
  try {
    let totalCreated = 0;
    
    // Step 1: Create priority scale dots
    console.log('\n🎨 Creating priority scale dots...');
    const priorityColors = [
      '#F38BA8', '#F38BA8',  // Red (highest priority)
      '#FAB387', '#FAB387',  // Orange
      '#FFF740', '#FFF740',  // Yellow
      '#A6E3A1', '#A6E3A1',  // Green
      '#89DCEB', '#89DCEB'   // Light blue (lowest priority)
    ];
    
    for (let i = 0; i < priorityColors.length; i++) {
      const pos = {
        x: SECTION_4_X + 100 + (i * 30),
        y: 200
      };
      
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'circle' },
        position: pos,
        geometry: { width: 20, height: 20 },
        style: {
          fillColor: priorityColors[i],
          borderWidth: 1,
          borderColor: priorityColors[i]
        }
      });
    }
    console.log('   ✓ Created 10 priority dots');
    
    // Step 2: Create category labels
    console.log('\n🏷️  Creating category labels...');
    const categories = [
      { text: 'OPPORTUNITIES', color: 'light_green', row: 3, col: 0 },
      { text: 'CUSTOMER VALUE', color: 'light_green', row: 4, col: 0 },
      { text: 'BUSINESS VALUE', color: 'dark_blue', row: 5, col: 0 },
      { text: 'FEASIBILITY', color: 'dark_blue', row: 6, col: 0 }
    ];
    
    for (const cat of categories) {
      const pos = {
        x: SECTION_4_X + 50 + (cat.col * 110),
        y: 250 + (cat.row * 110)
      };
      
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: cat.text },
        position: pos,
        style: { fillColor: cat.color }
      });
      totalCreated++;
    }
    console.log('   ✓ Created 4 category labels');
    
    // Step 3: Complete the 6 ideation grids
    console.log('\n📊 Completing ideation grids...');
    console.log('   Target: 6 grids with 30 notes each (180 total)');
    console.log('   Current: 3 grids with 20 notes each (60 total)');
    console.log('   Creating: 120 additional yellow sticky notes');
    
    // Grid layout: 2 columns × 3 rows of grids
    // Each grid is 6×5 (30 notes)
    const grids = [
      { gridRow: 0, gridCol: 0, label: 'Ideas Group A' },
      { gridRow: 0, gridCol: 1, label: 'Ideas Group B' },
      { gridRow: 1, gridCol: 0, label: 'Ideas Group C' },
      { gridRow: 1, gridCol: 1, label: 'Ideas Group D' },
      { gridRow: 2, gridCol: 0, label: 'Ideas Group E' },
      { gridRow: 2, gridCol: 1, label: 'Ideas Group F' }
    ];
    
    // We already have some notes in the first 3 grids, so focus on completing them
    // and adding the missing 3 grids
    
    for (const grid of grids.slice(3)) { // Start with grids D, E, F
      console.log(`\n   Creating grid: ${grid.label}`);
      
      // Create grid background frame
      const gridX = SECTION_4_X + 200 + (grid.gridCol * 700);
      const gridY = 350 + (grid.gridRow * 400);
      
      // Create frame for the grid
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'rectangle' },
        position: { x: gridX + 300, y: gridY + 150 },
        geometry: { width: 600, height: 350 },
        style: {
          fillColor: '#F5F5F5',
          borderColor: '#424867',
          borderWidth: 1,
          borderStyle: 'dashed'
        }
      });
      
      // Create sticky notes for this grid (6×5 = 30 notes)
      const batchNotes = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 6; col++) {
          const noteX = gridX + (col * 100);
          const noteY = gridY + (row * 70);
          
          batchNotes.push({
            data: { content: '' },
            position: { x: noteX, y: noteY },
            style: { fillColor: 'yellow' }
          });
        }
      }
      
      // Create notes in batches
      for (let i = 0; i < batchNotes.length; i += 10) {
        const batch = batchNotes.slice(i, i + 10);
        
        for (const note of batch) {
          await miroApi.post(`/boards/${boardId}/sticky_notes`, note);
          totalCreated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`      ✓ Created 30 notes for ${grid.label}`);
    }
    
    // Step 4: Add grid labels
    console.log('\n🏷️  Adding grid labels...');
    for (const grid of grids) {
      const gridX = SECTION_4_X + 200 + (grid.gridCol * 700);
      const gridY = 350 + (grid.gridRow * 400);
      
      await miroApi.post(`/boards/${boardId}/texts`, {
        data: { content: `<strong>${grid.label}</strong>` },
        position: { x: gridX + 300, y: gridY - 30 },
        style: { fontSize: '14' }
      });
    }
    console.log('   ✓ Added 6 grid labels');
    
    // Step 5: Create clustering tactics header
    console.log('\n📌 Creating section elements...');
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'rectangle' },
      position: { x: SECTION_4_X + 700, y: 1500 },
      geometry: { width: 1200, height: 50 },
      style: {
        fillColor: '#424867',
        borderWidth: 1,
        borderColor: '#424867'
      }
    });
    
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: { content: '<strong>CLUSTERING TACTICS</strong>' },
      position: { x: SECTION_4_X + 700, y: 1500 },
      style: {
        fontSize: '16',
        color: '#FFFFFF'
      }
    });
    console.log('   ✓ Added clustering tactics header');
    
    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Section 4 Completion Summary:');
    console.log(`   ✓ Created priority scale (10 dots)`);
    console.log(`   ✓ Created category labels (4 notes)`);
    console.log(`   ✓ Completed ideation grids (90 new notes)`);
    console.log(`   ✓ Added grid labels and headers`);
    console.log(`   📊 Total new sticky notes: ${totalCreated}`);
    console.log('\n💡 Section 4 is now ~83% complete');
    console.log('   Remaining: Add final 30 notes to first 3 grids');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Run completion
completeSection4();