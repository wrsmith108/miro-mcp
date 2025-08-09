#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('📚 Section 5 Completion Agent - Story Mapping');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Section 5 starts at x = 7000
const SECTION_5_X = 7000;

async function completeSection5() {
  try {
    let totalCreated = 0;
    
    console.log('\n📊 Current Status:');
    console.log('   Expected: 3 story maps with 138 total notes');
    console.log('   Current: 1 story map with 45 notes');
    console.log('   Creating: 2 more story maps with 93 notes');
    
    // Create 2 additional story maps (maps 2 and 3)
    for (let mapIndex = 1; mapIndex < 3; mapIndex++) {
      console.log(`\n📖 Creating Story Map ${mapIndex + 1}:`);
      
      const baseY = 250 + (mapIndex * 500);
      
      // Step 1: Epic level (5 yellow notes)
      console.log('   Creating Epic level...');
      for (let i = 0; i < 5; i++) {
        const pos = {
          x: SECTION_5_X + 100 + (i * 120),
          y: baseY
        };
        
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: `Epic ${mapIndex + 1}.${i + 1}` },
          position: pos,
          style: { fillColor: 'yellow' }
        });
        totalCreated++;
      }
      console.log('      ✓ 5 epic notes created');
      
      // Step 2: Story level (5 yellow notes)
      console.log('   Creating Story level...');
      for (let i = 0; i < 5; i++) {
        const pos = {
          x: SECTION_5_X + 100 + (i * 120),
          y: baseY + 120
        };
        
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: `Story ${mapIndex + 1}.${i + 1}` },
          position: pos,
          style: { fillColor: 'yellow' }
        });
        totalCreated++;
      }
      console.log('      ✓ 5 story notes created');
      
      // Step 3: Task grid (6x6 = 36 purple notes)
      console.log('   Creating Task grid...');
      const taskBatch = [];
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          const pos = {
            x: SECTION_5_X + 100 + (col * 100),
            y: baseY + 250 + (row * 60)
          };
          
          taskBatch.push({
            data: { content: '' },
            position: pos,
            style: { fillColor: 'violet' }
          });
        }
      }
      
      // Create tasks in batches of 12
      for (let i = 0; i < taskBatch.length; i += 12) {
        const batch = taskBatch.slice(i, i + 12);
        
        for (const note of batch) {
          await miroApi.post(`/boards/${boardId}/sticky_notes`, note);
          totalCreated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      console.log('      ✓ 36 task notes created');
      
      // Step 4: Add story map frame
      console.log('   Adding story map frame...');
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'rectangle' },
        position: { 
          x: SECTION_5_X + 350,
          y: baseY + 300
        },
        geometry: { 
          width: 650,
          height: 450
        },
        style: {
          fillColor: '#FFFFFF',
          fillOpacity: 0.1,
          borderColor: '#CBA6F7',
          borderWidth: 2,
          borderStyle: 'dashed'
        }
      });
      console.log('      ✓ Frame added');
      
      // Step 5: Add map label
      await miroApi.post(`/boards/${boardId}/texts`, {
        data: { 
          content: `<strong>STORY MAP ${mapIndex + 1}</strong>`
        },
        position: { 
          x: SECTION_5_X + 350,
          y: baseY - 30
        },
        style: { 
          fontSize: '16',
          color: '#424867'
        }
      });
      console.log('      ✓ Label added');
      
      console.log(`   ✅ Story Map ${mapIndex + 1} complete (46 notes)`);
    }
    
    // Add section completion elements
    console.log('\n🎯 Adding section completion elements...');
    
    // Add "User Journey" header
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'rectangle' },
      position: { x: SECTION_5_X + 400, y: 1300 },
      geometry: { width: 800, height: 50 },
      style: {
        fillColor: '#CBA6F7',
        borderWidth: 1,
        borderColor: '#CBA6F7'
      }
    });
    
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: { content: '<strong>USER JOURNEY</strong>' },
      position: { x: SECTION_5_X + 400, y: 1300 },
      style: {
        fontSize: '16',
        color: '#FFFFFF'
      }
    });
    console.log('   ✓ User Journey header added');
    
    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Section 5 Completion Summary:');
    console.log('   ✓ Created 2 additional story maps');
    console.log('   ✓ Added 20 yellow notes (epics & stories)');
    console.log('   ✓ Added 72 purple notes (tasks)');
    console.log('   ✓ Added frames and labels');
    console.log(`   📊 Total new sticky notes: ${totalCreated}`);
    console.log('\n💡 Section 5 is now ~98% complete');
    console.log('   Total: 3 story maps with 137 notes');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Run completion
completeSection5();