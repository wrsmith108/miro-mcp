#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🧪 Section 6 Completion Agent - Testing Assumptions');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Section 6 starts at x = 8400
const SECTION_6_X = 8400;

async function completeSection6() {
  try {
    let totalCreated = 0;
    
    console.log('\n📊 Current Status:');
    console.log('   Expected: 6 test canvases with 72 total notes');
    console.log('   Current: 3 test canvases with 36 notes');
    console.log('   Creating: 3 more test canvases with 36 notes');
    
    // Create 3 additional test canvases (canvases 4, 5, 6)
    const canvases = [
      { row: 1, col: 0, name: 'Test Canvas 4' },
      { row: 1, col: 1, name: 'Test Canvas 5' },
      { row: 1, col: 2, name: 'Test Canvas 6' }
    ];
    
    for (const canvas of canvases) {
      console.log(`\n🧪 Creating ${canvas.name}:`);
      
      const baseX = SECTION_6_X + 100 + (canvas.col * 400);
      const baseY = 600 + (canvas.row * 400);
      
      // Step 1: Create canvas headers
      console.log('   Creating canvas headers...');
      const headers = ['ASSUMPTION', 'SIMULATE', 'EVALUATE'];
      
      for (let h = 0; h < headers.length; h++) {
        const headerX = baseX + (h * 120);
        
        // Create header background
        await miroApi.post(`/boards/${boardId}/shapes`, {
          data: { shape: 'rectangle' },
          position: { x: headerX, y: baseY - 40 },
          geometry: { width: 110, height: 35 },
          style: {
            fillColor: '#424867',
            borderWidth: 1,
            borderColor: '#424867'
          }
        });
        
        // Create header text
        await miroApi.post(`/boards/${boardId}/texts`, {
          data: { content: headers[h] },
          position: { x: headerX, y: baseY - 40 },
          style: {
            fontSize: '12',
            color: '#FFFFFF'
          }
        });
      }
      console.log('      ✓ 3 headers created');
      
      // Step 2: Create test method labels (left column - dark blue)
      console.log('   Creating test method labels...');
      const methods = ['Prototype', '1 Question Survey', 'Data Mining', 'Research Spike'];
      
      for (let m = 0; m < methods.length; m++) {
        const pos = {
          x: baseX,
          y: baseY + 20 + (m * 70)
        };
        
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: methods[m] },
          position: pos,
          style: { fillColor: 'dark_blue' }
        });
        totalCreated++;
      }
      console.log('      ✓ 4 method labels created');
      
      // Step 3: Create result spaces (middle and right columns - yellow)
      console.log('   Creating result spaces...');
      for (let row = 0; row < 4; row++) {
        for (let col = 1; col < 3; col++) {
          const pos = {
            x: baseX + (col * 120),
            y: baseY + 20 + (row * 70)
          };
          
          await miroApi.post(`/boards/${boardId}/sticky_notes`, {
            data: { content: '' },
            position: pos,
            style: { fillColor: 'yellow' }
          });
          totalCreated++;
        }
      }
      console.log('      ✓ 8 result spaces created');
      
      // Step 4: Add canvas frame
      console.log('   Adding canvas frame...');
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'rectangle' },
        position: { 
          x: baseX + 180,
          y: baseY + 120
        },
        geometry: { 
          width: 380,
          height: 320
        },
        style: {
          fillColor: '#FFFFFF',
          fillOpacity: 0.1,
          borderColor: '#424867',
          borderWidth: 1,
          borderStyle: 'dotted'
        }
      });
      console.log('      ✓ Frame added');
      
      console.log(`   ✅ ${canvas.name} complete (12 notes)`);
    }
    
    // Add section completion elements
    console.log('\n🎯 Adding section completion elements...');
    
    // Add "Validation Methods" header
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'rectangle' },
      position: { x: SECTION_6_X + 600, y: 1100 },
      geometry: { width: 1000, height: 50 },
      style: {
        fillColor: '#424867',
        borderWidth: 1,
        borderColor: '#424867'
      }
    });
    
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: { content: '<strong>VALIDATION METHODS</strong>' },
      position: { x: SECTION_6_X + 600, y: 1100 },
      style: {
        fontSize: '16',
        color: '#FFFFFF'
      }
    });
    console.log('   ✓ Validation Methods header added');
    
    // Add example test criteria
    console.log('\n📝 Adding test criteria examples...');
    const criteria = [
      'Desirability: Do customers want this?',
      'Feasibility: Can we build this?',
      'Viability: Is this good for business?',
      'Usability: Can customers use this?'
    ];
    
    for (let i = 0; i < criteria.length; i++) {
      await miroApi.post(`/boards/${boardId}/texts`, {
        data: { content: `• ${criteria[i]}` },
        position: { 
          x: SECTION_6_X + 200,
          y: 1200 + (i * 30)
        },
        style: {
          fontSize: '12',
          color: '#424867'
        }
      });
    }
    console.log('   ✓ Test criteria added');
    
    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Section 6 Completion Summary:');
    console.log('   ✓ Created 3 additional test canvases');
    console.log('   ✓ Added 12 dark blue method labels');
    console.log('   ✓ Added 24 yellow result spaces');
    console.log('   ✓ Added frames and headers');
    console.log(`   📊 Total new sticky notes: ${totalCreated}`);
    console.log('\n💡 Section 6 is now ~100% complete');
    console.log('   Total: 6 test canvases with 72 notes');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Run completion
completeSection6();