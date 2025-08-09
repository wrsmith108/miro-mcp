#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('📐 PLACEMENT AND TEXT ANALYSIS');
console.log('Board ID:', boardId);
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Expected text elements from screenshots
const EXPECTED_TEXT = {
  section0: {
    mainTitle: '0. CONTINUOUS DISCOVERY HABITS MASTERCLASS',
    subTitles: ['AGENDA', 'EXAMPLES'],
    classLabels: [
      '1st CLASS', '2nd CLASS', '3rd CLASS',
      '4th CLASS', '5th CLASS', '6th CLASS'
    ]
  },
  section1: {
    mainTitle: '1. DEFINING OUTCOMES',
    subTitles: [
      'EVIDENCE-BASED TEAM DECISIONS, DEFINING OUTCOMES',
      'BUSINESS OUTCOMES',
      'PRODUCT OUTCOMES', 
      'TRACTION METRICS'
    ]
  },
  section2: {
    mainTitle: '2. INTERVIEWING',
    subTitles: [
      'CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES',
      'WHO TO INTERVIEW',
      'HOW TO RECRUIT',
      'WHEN TO INTERVIEW',
      'HOW TO INTERVIEW',
      'WHAT TO CAPTURE',
      'EXAMPLES'
    ]
  },
  section3: {
    mainTitle: '3. MAPPING OPPORTUNITIES',
    subTitles: [
      'MAPPING OPPORTUNITIES',
      'OPPORTUNITY SOLUTION TREE',
      'EXAMPLES'
    ]
  },
  section4: {
    mainTitle: '4. ASSESSING & PRIORITIZING',
    subTitles: [
      'ASSESSING & PRIORITIZING OPPORTUNITIES, EFFECTIVE SOLUTION IDEATION',
      'CONTEXT-DRIVEN PRIORITIZATION',
      'PRIORITIZING OPPORTUNITIES',
      'EFFECTIVE IDEATION',
      'EXAMPLES'
    ]
  },
  section5: {
    mainTitle: '5. SOLUTION STORY MAPPING',
    subTitles: [
      'STORY MAPPING, ASSUMPTION MAPPING',
      'STORY MAP 1',
      'STORY MAP 2',
      'STORY MAP 3',
      'EXAMPLES'
    ]
  },
  section6: {
    mainTitle: '6. TESTING ASSUMPTIONS',
    subTitles: [
      'TESTING ASSUMPTIONS',
      'ASSUMPTION', 'SIMULATE', 'EVALUATE',
      'EXAMPLES'
    ]
  }
};

// Expected positioning patterns
const LAYOUT_PATTERNS = {
  section1: {
    structure: '3-tier vertical',
    groups: [
      { name: 'Business Outcomes', y: 300, count: 3, arrangement: 'horizontal' },
      { name: 'Product Outcomes', y: 500, count: 6, arrangement: '2x3 grid' },
      { name: 'Traction Metrics', y: 700, count: 8, arrangement: '2x4 grid' }
    ]
  },
  section2: {
    structure: '5 rows',
    rows: [
      { label: 'WHO TO INTERVIEW', y: 400, count: 5 },
      { label: 'HOW TO RECRUIT', y: 600, count: 5 },
      { label: 'WHEN TO INTERVIEW', y: 800, count: 5 },
      { label: 'HOW TO INTERVIEW', y: 1000, count: 5 },
      { label: 'WHAT TO CAPTURE', y: 1200, count: 5 }
    ]
  },
  section3: {
    structure: 'hierarchical tree',
    levels: [
      { level: 'top', y: 400, count: 3, color: 'green' },
      { level: 'middle', y: 600, count: 6, color: 'green' },
      { level: 'bottom', y: 800, count: 3, color: 'blue' }
    ]
  },
  section4: {
    structure: '6 ideation grids',
    grids: [
      { position: 'top-left', x: 5700, y: 400 },
      { position: 'top-right', x: 6300, y: 400 },
      { position: 'middle-left', x: 5700, y: 900 },
      { position: 'middle-right', x: 6300, y: 900 },
      { position: 'bottom-left', x: 5700, y: 1400 },
      { position: 'bottom-right', x: 6300, y: 1400 }
    ]
  },
  section5: {
    structure: '3 story maps',
    maps: [
      { name: 'Map 1', y: 300, epicRows: 2, taskGrid: '6x6' },
      { name: 'Map 2', y: 1000, epicRows: 2, taskGrid: '6x6' },
      { name: 'Map 3', y: 1700, epicRows: 2, taskGrid: '6x6' }
    ]
  },
  section6: {
    structure: '6 test canvases',
    canvases: [
      { position: 'top-left', x: 8500, y: 400 },
      { position: 'top-middle', x: 9000, y: 400 },
      { position: 'top-right', x: 9500, y: 400 },
      { position: 'bottom-left', x: 8500, y: 900 },
      { position: 'bottom-middle', x: 9000, y: 900 },
      { position: 'bottom-right', x: 9500, y: 900 }
    ]
  }
};

async function analyzePlacementAndText() {
  const report = {
    timestamp: new Date().toISOString(),
    placementIssues: [],
    missingText: [],
    misalignedGroups: [],
    recommendations: []
  };

  try {
    console.log('\n📊 Phase 1: Collecting Items');
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
    
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const textItems = allItems.filter(item => item.type === 'text');
    
    // Phase 2: Check text elements
    console.log('\n📝 Phase 2: Text Element Analysis');
    console.log('─'.repeat(50));
    
    for (let section = 0; section <= 6; section++) {
      const sectionX = section * 1400;
      const expectedText = EXPECTED_TEXT[`section${section}`];
      
      console.log(`\n   Section ${section}:`);
      
      // Check for main title
      const hasMainTitle = textItems.some(text => 
        text.position.x >= sectionX &&
        text.position.x < sectionX + 1400 &&
        text.position.y < 100
      );
      
      if (!hasMainTitle) {
        report.missingText.push({
          section,
          type: 'main_title',
          content: expectedText.mainTitle
        });
        console.log(`      ❌ Missing main title: ${expectedText.mainTitle}`);
      } else {
        console.log(`      ✓ Main title present`);
      }
      
      // Check for subtitles
      expectedText.subTitles.forEach(subtitle => {
        const hasSubtitle = textItems.some(text => 
          text.position.x >= sectionX &&
          text.position.x < sectionX + 1400 &&
          (text.data?.content?.includes(subtitle.split(' ')[0]) || 
           text.data?.content?.includes(subtitle))
        );
        
        if (!hasSubtitle) {
          report.missingText.push({
            section,
            type: 'subtitle',
            content: subtitle
          });
          console.log(`      ⚠️ Missing subtitle: ${subtitle}`);
        }
      });
    }
    
    // Phase 3: Check sticky note placement
    console.log('\n📍 Phase 3: Sticky Note Placement Analysis');
    console.log('─'.repeat(50));
    
    // Section 1: Check 3-tier structure
    const section1Stickies = stickyNotes.filter(item =>
      item.position.x >= 1400 && item.position.x < 2800
    );
    
    if (section1Stickies.length === 17) {
      // Group by Y position
      const topRow = section1Stickies.filter(s => s.position.y < 400).length;
      const middleRows = section1Stickies.filter(s => s.position.y >= 400 && s.position.y < 700).length;
      const bottomRows = section1Stickies.filter(s => s.position.y >= 700).length;
      
      console.log(`   Section 1: ${topRow} top, ${middleRows} middle, ${bottomRows} bottom`);
      
      if (topRow !== 3 || middleRows !== 6 || bottomRows !== 8) {
        report.misalignedGroups.push({
          section: 1,
          issue: `Incorrect tier distribution: ${topRow}/3 top, ${middleRows}/6 middle, ${bottomRows}/8 bottom`
        });
      }
    }
    
    // Section 2: Check 5-row structure
    const section2Stickies = stickyNotes.filter(item =>
      item.position.x >= 2800 && item.position.x < 4200
    );
    
    console.log(`   Section 2: ${section2Stickies.length} stickies`);
    
    // Calculate row distribution
    const rowRanges = [
      { min: 300, max: 500 },
      { min: 500, max: 700 },
      { min: 700, max: 900 },
      { min: 900, max: 1100 },
      { min: 1100, max: 1300 }
    ];
    
    rowRanges.forEach((range, index) => {
      const count = section2Stickies.filter(s => 
        s.position.y >= range.min && s.position.y < range.max
      ).length;
      
      if (count !== 5 && count !== 6) {
        report.placementIssues.push({
          section: 2,
          row: index + 1,
          issue: `Row ${index + 1} has ${count} items, expected 5`
        });
      }
    });
    
    // Section 4: Check grid alignment
    const section4Stickies = stickyNotes.filter(item =>
      item.position.x >= 5600 && item.position.x < 7000
    );
    
    console.log(`   Section 4: ${section4Stickies.length} stickies`);
    
    // Check if organized in 6 grids
    const gridBounds = LAYOUT_PATTERNS.section4.grids;
    gridBounds.forEach((grid, index) => {
      const gridItems = section4Stickies.filter(s =>
        Math.abs(s.position.x - grid.x) < 300 &&
        Math.abs(s.position.y - grid.y) < 300
      );
      
      if (gridItems.length < 20 || gridItems.length > 30) {
        report.placementIssues.push({
          section: 4,
          grid: index + 1,
          issue: `Grid ${index + 1} has ${gridItems.length} items, expected ~25`
        });
      }
    });
    
    // Section 5: Check story map organization
    const section5Stickies = stickyNotes.filter(item =>
      item.position.x >= 7000 && item.position.x < 8400
    );
    
    const section5Yellows = section5Stickies.filter(s => 
      s.style?.fillColor === 'yellow' || s.style?.fillColor === 'light_yellow'
    );
    const section5Purples = section5Stickies.filter(s =>
      s.style?.fillColor === 'violet' || s.style?.fillColor === 'purple'
    );
    
    console.log(`   Section 5: ${section5Yellows.length} yellow, ${section5Purples.length} purple`);
    
    // Check vertical separation of maps
    const mapYRanges = [
      { min: 200, max: 800 },
      { min: 900, max: 1500 },
      { min: 1600, max: 2200 }
    ];
    
    mapYRanges.forEach((range, index) => {
      const mapYellows = section5Yellows.filter(s =>
        s.position.y >= range.min && s.position.y < range.max
      ).length;
      const mapPurples = section5Purples.filter(s =>
        s.position.y >= range.min && s.position.y < range.max
      ).length;
      
      if (mapYellows !== 10 || mapPurples !== 36) {
        report.misalignedGroups.push({
          section: 5,
          map: index + 1,
          issue: `Map ${index + 1}: ${mapYellows}/10 yellow, ${mapPurples}/36 purple`
        });
      }
    });
    
    // Generate recommendations
    console.log('\n💡 Phase 4: Generating Recommendations');
    console.log('─'.repeat(50));
    
    if (report.missingText.length > 0) {
      report.recommendations.push('Add missing section titles and labels');
    }
    
    if (report.placementIssues.length > 0) {
      report.recommendations.push('Reorganize sticky notes into proper grid/row structures');
    }
    
    if (report.misalignedGroups.length > 0) {
      report.recommendations.push('Realign groups to match expected patterns');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📋 PLACEMENT AND TEXT ANALYSIS SUMMARY');
    console.log('═'.repeat(70));
    
    console.log('\n📝 Missing Text Elements:', report.missingText.length);
    report.missingText.slice(0, 5).forEach(text => {
      console.log(`   - Section ${text.section}: ${text.type} - "${text.content}"`);
    });
    
    console.log('\n📍 Placement Issues:', report.placementIssues.length);
    report.placementIssues.slice(0, 5).forEach(issue => {
      console.log(`   - Section ${issue.section}: ${issue.issue}`);
    });
    
    console.log('\n🔄 Misaligned Groups:', report.misalignedGroups.length);
    report.misalignedGroups.slice(0, 5).forEach(group => {
      console.log(`   - Section ${group.section}: ${group.issue}`);
    });
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    
    // Save report
    fs.writeFileSync('placement-analysis.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Full report saved to: placement-analysis.json');
    
    return report;
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run analysis
analyzePlacementAndText();