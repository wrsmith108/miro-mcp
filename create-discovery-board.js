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

// Positioning Framework (matching server implementation)
class BoardLayout {
  constructor() {
    this.sectionWidth = 1400;
    this.sectionHeight = 1800;
    this.workAreaHeight = 1200;
    this.examplesHeight = 600;
    this.padding = 50;
    this.stickySize = { width: 100, height: 100 };
    this.gridGap = 10;
  }

  getSectionPosition(sectionIndex) {
    return {
      x: sectionIndex * this.sectionWidth,
      y: 0
    };
  }

  getStickyPosition(sectionIndex, row, col) {
    const section = this.getSectionPosition(sectionIndex);
    return {
      x: section.x + this.padding + (col * (this.stickySize.width + this.gridGap)),
      y: section.y + 150 + (row * (this.stickySize.height + this.gridGap))
    };
  }

  getSectionHeaderPosition(sectionIndex) {
    const section = this.getSectionPosition(sectionIndex);
    return {
      x: section.x + this.sectionWidth / 2,
      y: section.y + 30
    };
  }
}

// Color System (matching server implementation)
const ColorSystem = {
  COLORS: {
    darkBg: '#424867',
    lightBg: '#F5F5F5',
    yellow: '#FFF740',
    green: '#A6E3A1',
    purple: '#CBA6F7',
    pink: '#F5C2E7',
    darkBlue: '#424867',
    white: '#FFFFFF',
    black: '#000000'
  },

  getTextColor(bgColor) {
    // Simplified luminance calculation
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
};

const layout = new BoardLayout();

async function createBoard() {
  try {
    // Phase 1: Create Section Headers
    console.log('\n📋 Phase 1: Creating Section Headers...');
    await createSectionHeaders();
    
    // Phase 2: Section 0 - Continuous Discovery
    console.log('\n📋 Phase 2: Creating Section 0 - Continuous Discovery...');
    await createSection0();
    
    // Phase 3: Section 1 - Defining Outcomes
    console.log('\n📋 Phase 3: Creating Section 1 - Defining Outcomes...');
    await createSection1();
    
    // Phase 4: Section 2 - Interviewing
    console.log('\n📋 Phase 4: Creating Section 2 - Interviewing...');
    await createSection2();
    
    // Phase 5: Section 3 - Mapping Opportunities
    console.log('\n📋 Phase 5: Creating Section 3 - Mapping Opportunities...');
    await createSection3();
    
    // Phase 6: Section 4 - Assessing & Prioritizing
    console.log('\n📋 Phase 6: Creating Section 4 - Assessing & Prioritizing...');
    await createSection4();
    
    // Phase 7: Section 5 - Story Mapping
    console.log('\n📋 Phase 7: Creating Section 5 - Story Mapping...');
    await createSection5();
    
    // Phase 8: Section 6 - Testing Assumptions
    console.log('\n📋 Phase 8: Creating Section 6 - Testing Assumptions...');
    await createSection6();
    
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Board creation complete!');
    console.log(`View your board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    if (error.response && error.response.data && error.response.data.context) {
      console.error('Error details:', JSON.stringify(error.response.data.context, null, 2));
    }
  }
}

async function createSectionHeaders() {
  const sections = [
    { index: 0, title: '0. CONTINUOUS DISCOVERY HABITS MASTERCLASS', subtitle: '' },
    { index: 1, title: '1. DEFINING OUTCOMES', subtitle: 'EVIDENCE-BASED TEAM DECISIONS' },
    { index: 2, title: '2. INTERVIEWING', subtitle: 'CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES' },
    { index: 3, title: '3. MAPPING OPPORTUNITIES', subtitle: '' },
    { index: 4, title: '4. ASSESSING & PRIORITIZING', subtitle: 'EFFECTIVE SOLUTION IDEATION' },
    { index: 5, title: '5. SOLUTION STORY MAPPING', subtitle: 'ASSUMPTION MAPPING' },
    { index: 6, title: '6. TESTING ASSUMPTIONS', subtitle: 'DEFINE PROTOTYPE TO TESTING ASSUMPTIONS' }
  ];

  for (const section of sections) {
    const headerPos = layout.getSectionHeaderPosition(section.index);
    
    // Create header background
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'rectangle' },
      position: { x: headerPos.x - 650, y: headerPos.y - 20 },
      geometry: { width: 1300, height: 60 },
      style: {
        fillColor: ColorSystem.COLORS.darkBg,
        borderWidth: 1,
        borderColor: ColorSystem.COLORS.darkBg
      }
    });
    
    // Create header text
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: `<strong>${section.title}</strong>${section.subtitle ? `<br/>${section.subtitle}` : ''}`
      },
      position: headerPos,
      style: {
        fontSize: '18',
        textAlign: 'center',
        color: ColorSystem.COLORS.white
      }
    });
    
    console.log(`   ✓ Section ${section.index} header created`);
  }
}

async function createSection0() {
  // AGENDA box
  const agendaPos = layout.getStickyPosition(0, 1, 1);
  await miroApi.post(`/boards/${boardId}/shapes`, {
    data: { shape: 'rectangle' },
    position: { x: agendaPos.x, y: agendaPos.y },
    geometry: { width: 600, height: 400 },
    style: {
      fillColor: ColorSystem.COLORS.white,
      borderColor: ColorSystem.COLORS.darkBg,
      borderWidth: 2
    }
  });
  
  // AGENDA title
  await miroApi.post(`/boards/${boardId}/texts`, {
    data: {
      content: '<strong>AGENDA</strong>'
    },
    position: { x: agendaPos.x + 300, y: agendaPos.y + 30 },
    style: { 
      fontSize: '24'
    }
  });
  
  // Add class descriptions
  const classes = [
    { row: 0, col: 0, title: '1st CLASS', desc: 'Setting Up Evidence-Based, Team Decisions\nDefining Clear Desired Outcomes' },
    { row: 0, col: 1, title: '2nd CLASS', desc: 'Adopt Continuous Interviewing\nDiscover the Recruiting Process\nAsk the Right Questions\nListen for Insights & Opportunities' },
    { row: 1, col: 0, title: '3rd CLASS', desc: 'Synthesize Across Interviews\nMap Your Customer Experience\nVote as a Collaborative Team' },
    { row: 1, col: 1, title: '4th CLASS', desc: 'Prioritizing Opportunities\nEffective Ideation' },
    { row: 2, col: 0, title: '5th CLASS', desc: 'Story Mapping Solutions\nIdentify Key Assumptions\nAssumption Mapping' },
    { row: 2, col: 1, title: '6th CLASS', desc: 'Experiments: Test on Assumption\nPrototypes Surveys on Experience\nAnalyze Data to Discovery' }
  ];
  
  for (const cls of classes) {
    const x = agendaPos.x + 50 + (cls.col * 280);
    const y = agendaPos.y + 80 + (cls.row * 100);
    
    await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: `<strong>${cls.title}</strong><br/>${cls.desc}`
      },
      position: { x: x + 140, y: y + 30 },
      style: { 
        fontSize: '12'
      }
    });
  }
  
  console.log('   ✓ Section 0 AGENDA created');
}

async function createSection1() {
  // Business Outcomes
  const businessLabel = layout.getStickyPosition(1, 1, 1);
  await createCategoryLabel(businessLabel, 'BUSINESS OUTCOMES', 'Financial, topline, confidence');
  
  // Create 3 yellow sticky notes for business outcomes
  for (let i = 0; i < 3; i++) {
    await createStickyNote(1, 2, 1 + i, '', ColorSystem.COLORS.yellow);
  }
  
  // Product Outcomes
  const productLabel = layout.getStickyPosition(1, 1, 5);
  await createCategoryLabel(productLabel, 'PRODUCT OUTCOMES', 'Engagement-based, leading indicators');
  
  // Create 6 yellow sticky notes for product outcomes (2x3 grid)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      await createStickyNote(1, 2 + row, 5 + col, '', ColorSystem.COLORS.yellow);
    }
  }
  
  // Traction Metrics
  const tractionLabel = layout.getStickyPosition(1, 1, 9);
  await createCategoryLabel(tractionLabel, 'TRACTION METRICS', 'Feature metrics');
  
  // Create 5 yellow sticky notes for traction metrics
  for (let i = 0; i < 5; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    await createStickyNote(1, 2 + row, 9 + col, '', ColorSystem.COLORS.yellow);
  }
  
  console.log('   ✓ Section 1 with 17 yellow sticky notes created');
}

async function createSection2() {
  // Interview structure header
  const interviewHeader = layout.getStickyPosition(2, 1, 1);
  await createCategoryLabel(interviewHeader, '2. CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES', '');
  
  // Interview categories with yellow sticky notes
  const categories = [
    { row: 3, label: 'WHO TO INTERVIEW', notes: 5 },
    { row: 4, label: 'RECRUITING', notes: 6 },
    { row: 5, label: 'INTERVIEW QUESTIONS', notes: 6 },
    { row: 6, label: 'LISTENING', notes: 6 },
    { row: 7, label: 'FOLLOW-UP', notes: 7 }
  ];
  
  for (const cat of categories) {
    const labelPos = layout.getStickyPosition(2, cat.row, 0);
    await createCategoryLabel(labelPos, cat.label, '');
    
    // Create yellow sticky notes
    for (let i = 0; i < cat.notes; i++) {
      await createStickyNote(2, cat.row, 2 + i, '', ColorSystem.COLORS.yellow);
    }
  }
  
  console.log('   ✓ Section 2 with 30 yellow sticky notes created');
}

async function createSection3() {
  // Key Moments header
  const keyMomentsPos = layout.getStickyPosition(3, 1, 1);
  await createCategoryLabel(keyMomentsPos, 'IDENTIFY YOUR KEY MOMENTS', '');
  
  // Create 4 green sticky notes for key moments
  for (let i = 0; i < 4; i++) {
    await createStickyNote(3, 2, 1 + i, '', ColorSystem.COLORS.green);
  }
  
  // Opportunity Brainstorm header
  const brainstormPos = layout.getStickyPosition(3, 4, 1);
  await createCategoryLabel(brainstormPos, 'OPPORTUNITY BRAINSTORM', '');
  
  // Create 12 green sticky notes (3 rows x 4 cols)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      await createStickyNote(3, 5 + row, 1 + col, '', ColorSystem.COLORS.green);
    }
  }
  
  console.log('   ✓ Section 3 with 16 green sticky notes created');
}

async function createSection4() {
  // Priority scale dots
  const colors = ['#F38BA8', '#FAB387', '#FFF740', '#A6E3A1', '#89DCEB'];
  for (let i = 0; i < 12; i++) {
    const colorIndex = Math.floor(i / 2.4);
    const pos = layout.getStickyPosition(4, 1, 2 + i);
    await miroApi.post(`/boards/${boardId}/shapes`, {
      data: { shape: 'circle' },
      position: { x: pos.x, y: pos.y },
      geometry: { width: 20, height: 20 },
      style: { fillColor: colors[colorIndex] }
    });
  }
  
  // Create 6 ideation grids (simplified - creating just outlines)
  for (let gridRow = 0; gridRow < 3; gridRow++) {
    for (let gridCol = 0; gridCol < 2; gridCol++) {
      const baseRow = 3 + (gridRow * 7);
      const baseCol = 1 + (gridCol * 7);
      
      // Create grid background
      const gridPos = layout.getStickyPosition(4, baseRow, baseCol);
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: { shape: 'rectangle' },
        position: { x: gridPos.x + 250, y: gridPos.y + 250 },
        geometry: { width: 550, height: 550 },
        style: {
          fillColor: ColorSystem.COLORS.lightBg,
          borderColor: ColorSystem.COLORS.darkBg,
          borderWidth: 1,
          borderStyle: 'dashed'
        }
      });
      
      // Create sample sticky notes (5x5 grid = 25 per grid)
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          await createStickyNote(4, baseRow + r, baseCol + c, '', ColorSystem.COLORS.yellow);
        }
      }
    }
  }
  
  console.log('   ✓ Section 4 with priority scale and 150 yellow sticky notes created');
}

async function createSection5() {
  // Create 3 story maps
  for (let mapIndex = 0; mapIndex < 3; mapIndex++) {
    const baseRow = 2 + (mapIndex * 8);
    
    // Epic level (yellow)
    for (let i = 0; i < 5; i++) {
      await createStickyNote(5, baseRow, 1 + i, 'Epic', ColorSystem.COLORS.yellow);
    }
    
    // Story level (yellow)
    for (let i = 0; i < 5; i++) {
      await createStickyNote(5, baseRow + 1, 1 + i, 'Story', ColorSystem.COLORS.yellow);
    }
    
    // Task grid (purple) - 6x6 = 36 per map
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        await createStickyNote(5, baseRow + 2 + r, 1 + c, '', ColorSystem.COLORS.purple);
      }
    }
  }
  
  console.log('   ✓ Section 5 with 3 story maps (108 purple + 30 yellow notes) created');
}

async function createSection6() {
  // Create 6 testing canvases (2x3 layout)
  for (let canvasRow = 0; canvasRow < 2; canvasRow++) {
    for (let canvasCol = 0; canvasCol < 3; canvasCol++) {
      const baseRow = 2 + (canvasRow * 8);
      const baseCol = 1 + (canvasCol * 4);
      
      // Canvas headers
      const headers = ['ASSUMPTION', 'SIMULATE', 'EVALUATE'];
      for (let h = 0; h < 3; h++) {
        const headerPos = layout.getStickyPosition(6, baseRow, baseCol + h);
        await miroApi.post(`/boards/${boardId}/shapes`, {
          data: { shape: 'rectangle' },
          position: headerPos,
          geometry: { width: 100, height: 30 },
          style: {
            fillColor: ColorSystem.COLORS.darkBg,
            borderWidth: 1,
            borderColor: ColorSystem.COLORS.darkBg
          }
        });
        
        await miroApi.post(`/boards/${boardId}/texts`, {
          data: { content: headers[h] },
          position: { x: headerPos.x, y: headerPos.y },
          style: { 
            fontSize: '12',
            color: ColorSystem.COLORS.white
          }
        });
      }
      
      // Test method labels (left column)
      const methods = ['Prototype', '1 Question Survey', 'Data Mining', 'Research Spike'];
      for (let m = 0; m < 4; m++) {
        const methodPos = layout.getStickyPosition(6, baseRow + 1 + m, baseCol);
        await createStickyNote(6, baseRow + 1 + m, baseCol, methods[m], ColorSystem.COLORS.darkBlue);
      }
      
      // Yellow sticky spaces (middle and right columns)
      for (let r = 0; r < 4; r++) {
        for (let c = 1; c < 3; c++) {
          await createStickyNote(6, baseRow + 1 + r, baseCol + c, '', ColorSystem.COLORS.yellow);
        }
      }
    }
  }
  
  // Success message
  const successPos = layout.getStickyPosition(6, 12, 5);
  await miroApi.post(`/boards/${boardId}/texts`, {
    data: {
      content: '<strong>Way to go! You just learned Continuous Discovery Habits! 🎉</strong>'
    },
    position: successPos,
    style: { 
      fontSize: '24'
    }
  });
  
  console.log('   ✓ Section 6 with 6 testing canvases created');
}

// Helper function to create sticky notes
async function createStickyNote(section, row, col, text, color) {
  const pos = layout.getStickyPosition(section, row, col);
  const textColor = ColorSystem.getTextColor(color);
  
  return await miroApi.post(`/boards/${boardId}/sticky_notes`, {
    data: { content: text || '' },
    position: pos,
    style: {
      fillColor: color,
      textColor: textColor
    }
  });
}

// Helper function to create category labels
async function createCategoryLabel(position, title, subtitle) {
  await miroApi.post(`/boards/${boardId}/shapes`, {
    data: { shape: 'rectangle' },
    position: position,
    geometry: { width: 300, height: 60 },
    style: {
      fillColor: ColorSystem.COLORS.darkBg,
      borderWidth: 1,
      borderColor: ColorSystem.COLORS.darkBg
    }
  });
  
  await miroApi.post(`/boards/${boardId}/texts`, {
    data: {
      content: `<strong>${title}</strong>${subtitle ? `<br/>${subtitle}` : ''}`
    },
    position: { x: position.x, y: position.y },
    style: { 
      fontSize: '14',
      color: ColorSystem.COLORS.white
    }
  });
}

// Run the board creation
createBoard();