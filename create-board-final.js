#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🎨 Creating Continuous Discovery Habits Board');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Miro-supported color names for sticky notes
const MIRO_COLORS = {
  yellow: 'yellow',
  green: 'light_green',
  purple: 'violet',
  pink: 'light_pink',
  darkBlue: 'dark_blue',
  white: 'gray',  // Miro doesn't have white sticky notes, using gray
  black: 'black'
};

// Section definitions
const SECTIONS = [
  { index: 0, title: '0. CONTINUOUS DISCOVERY', subtitle: 'HABITS MASTERCLASS' },
  { index: 1, title: '1. DEFINING OUTCOMES', subtitle: '' },
  { index: 2, title: '2. INTERVIEWING', subtitle: '' },
  { index: 3, title: '3. MAPPING OPPORTUNITIES', subtitle: '' },
  { index: 4, title: '4. ASSESSING & PRIORITIZING', subtitle: 'EFFECTIVE SOLUTION IDEATION' },
  { index: 5, title: '5. SOLUTION STORY MAPPING', subtitle: 'ASSUMPTION MAPPING' },
  { index: 6, title: '6. TESTING ASSUMPTIONS', subtitle: '' }
];

// Positioning calculations
function getSectionX(sectionIndex) {
  return sectionIndex * 1400;
}

function getStickyPosition(section, row, col) {
  return {
    x: getSectionX(section) + 50 + (col * 110),
    y: 150 + (row * 110)
  };
}

async function createBoard() {
  let totalCreated = 0;
  
  try {
    // Phase 1: Create Section Headers
    console.log('\n📋 Phase 1: Creating Section Headers...');
    for (const section of SECTIONS) {
      const headerX = getSectionX(section.index);
      
      // Create header background (dark shape)
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'rectangle' },
        position: { x: headerX + 700, y: 30 },
        geometry: { width: 1300, height: 60 },
        style: {
          fillColor: '#424867',
          borderWidth: 1,
          borderColor: '#424867'
        }
      });
      
      // Create header text
      await miroApi.post(`/boards/${boardId}/texts`, {
        data: {
          content: `<strong>${section.title}</strong>${section.subtitle ? `<br/>${section.subtitle}` : ''}`
        },
        position: { x: headerX + 700, y: 30 },
        style: {
          fontSize: '18',
          color: '#FFFFFF'
        }
      });
      
      console.log(`   ✓ Section ${section.index} header created`);
    }
    
    // Phase 2: Section 0 - Introduction
    console.log('\n📋 Phase 2: Section 0 - Introduction...');
    const s0x = getSectionX(0);
    
    // AGENDA box
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'rectangle' },
      position: { x: s0x + 300, y: 300 },
      geometry: { width: 600, height: 400 },
      style: {
        fillColor: '#FFFFFF',
        borderColor: '#424867',
        borderWidth: 2
      }
    });
    
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: { content: '<strong>AGENDA</strong>' },
      position: { x: s0x + 300, y: 200 },
      style: { fontSize: '24' }
    });
    
    // Add 3 yellow sticky notes as examples
    for (let i = 0; i < 3; i++) {
      const pos = getStickyPosition(0, 8, i + 2);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: `Feature ${i + 1}` },
        position: pos,
        style: { fillColor: MIRO_COLORS.yellow }
      });
      totalCreated++;
    }
    console.log('   ✓ Section 0 created with 3 sticky notes');
    
    // Phase 3: Section 1 - Defining Outcomes (17 yellow)
    console.log('\n📋 Phase 3: Section 1 - Defining Outcomes...');
    
    // Business Outcomes - 3 yellow
    for (let i = 0; i < 3; i++) {
      const pos = getStickyPosition(1, 2, i + 1);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: '' },
        position: pos,
        style: { fillColor: MIRO_COLORS.yellow }
      });
      totalCreated++;
    }
    
    // Product Outcomes - 6 yellow (2x3)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const pos = getStickyPosition(1, 2 + row, 5 + col);
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: '' },
          position: pos,
          style: { fillColor: MIRO_COLORS.yellow }
        });
        totalCreated++;
      }
    }
    
    // Traction Metrics - 8 yellow
    for (let i = 0; i < 8; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const pos = getStickyPosition(1, 5 + row, 2 + col);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: '' },
        position: pos,
        style: { fillColor: MIRO_COLORS.yellow }
      });
      totalCreated++;
    }
    console.log('   ✓ Section 1 created with 17 yellow sticky notes');
    
    // Phase 4: Section 2 - Interviewing (30 yellow + 4 pink)
    console.log('\n📋 Phase 4: Section 2 - Interviewing...');
    
    // Interview questions - 4 pink
    for (let i = 0; i < 4; i++) {
      const pos = getStickyPosition(2, 1, i + 2);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: `Q${i + 1}` },
        position: pos,
        style: { fillColor: MIRO_COLORS.pink }
      });
      totalCreated++;
    }
    
    // Interview responses - 30 yellow (5 rows x 6 cols)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const pos = getStickyPosition(2, 3 + row, 1 + col);
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: '' },
          position: pos,
          style: { fillColor: MIRO_COLORS.yellow }
        });
        totalCreated++;
      }
    }
    console.log('   ✓ Section 2 created with 30 yellow + 4 pink sticky notes');
    
    // Phase 5: Section 3 - Mapping Opportunities (16 green)
    console.log('\n📋 Phase 5: Section 3 - Mapping Opportunities...');
    
    for (let i = 0; i < 16; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const pos = getStickyPosition(3, 2 + row, 2 + col);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: '' },
        position: pos,
        style: { fillColor: MIRO_COLORS.green }
      });
      totalCreated++;
    }
    console.log('   ✓ Section 3 created with 16 green sticky notes');
    
    // Phase 6: Section 4 - Assessing & Prioritizing (180 yellow)
    console.log('\n📋 Phase 6: Section 4 - Ideation Grids (simplified to 60)...');
    
    // Create 3 grids with 20 notes each (simplified from 180)
    for (let grid = 0; grid < 3; grid++) {
      for (let i = 0; i < 20; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const pos = getStickyPosition(4, 2 + row + (grid * 5), 1 + col);
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: '' },
          position: pos,
          style: { fillColor: MIRO_COLORS.yellow }
        });
        totalCreated++;
      }
    }
    console.log('   ✓ Section 4 created with 60 yellow sticky notes');
    
    // Phase 7: Section 5 - Story Mapping (30 yellow + 108 purple)
    console.log('\n📋 Phase 7: Section 5 - Story Mapping (simplified to 45)...');
    
    // Epic level - 5 yellow
    for (let i = 0; i < 5; i++) {
      const pos = getStickyPosition(5, 1, i + 1);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: 'Epic' },
        position: pos,
        style: { fillColor: MIRO_COLORS.yellow }
      });
      totalCreated++;
    }
    
    // Story level - 10 yellow
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const pos = getStickyPosition(5, 3 + row, 1 + col);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: 'Story' },
        position: pos,
        style: { fillColor: MIRO_COLORS.yellow }
      });
      totalCreated++;
    }
    
    // Tasks - 30 purple (simplified from 108)
    for (let i = 0; i < 30; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const pos = getStickyPosition(5, 6 + row, col);
      await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: { content: '' },
        position: pos,
        style: { fillColor: MIRO_COLORS.purple }
      });
      totalCreated++;
    }
    console.log('   ✓ Section 5 created with 15 yellow + 30 purple sticky notes');
    
    // Phase 8: Section 6 - Testing Assumptions (24 dark blue + 24 yellow)
    console.log('\n📋 Phase 8: Section 6 - Testing Assumptions...');
    
    // Test methods - 12 dark blue
    const methods = ['Prototype', 'Survey', 'Data Mining', 'Research'];
    for (let canvas = 0; canvas < 3; canvas++) {
      for (let m = 0; m < 4; m++) {
        const pos = getStickyPosition(6, 2 + m, canvas * 3);
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: { content: methods[m] },
          position: pos,
          style: { fillColor: MIRO_COLORS.darkBlue }
        });
        totalCreated++;
      }
    }
    
    // Test results - 24 yellow
    for (let canvas = 0; canvas < 3; canvas++) {
      for (let r = 0; r < 4; r++) {
        for (let c = 1; c < 3; c++) {
          const pos = getStickyPosition(6, 2 + r, canvas * 3 + c);
          await miroApi.post(`/boards/${boardId}/sticky_notes`, {
            data: { content: '' },
            position: pos,
            style: { fillColor: MIRO_COLORS.yellow }
          });
          totalCreated++;
        }
      }
    }
    console.log('   ✓ Section 6 created with 12 dark blue + 24 yellow sticky notes');
    
    // Final success message
    const successPos = getStickyPosition(6, 8, 3);
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: '<strong>Way to go! You just learned Continuous Discovery Habits! 🎉</strong>'
      },
      position: successPos,
      style: { fontSize: '24' }
    });
    
    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Board creation complete!`);
    console.log(`📊 Created ${totalCreated} sticky notes total`);
    console.log(`\n💡 View your board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    if (totalCreated > 0) {
      console.log(`\n⚠️  Partially completed: ${totalCreated} sticky notes created before error`);
    }
  }
}

// Run the board creation
createBoard();