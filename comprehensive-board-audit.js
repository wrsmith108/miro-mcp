#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 COMPREHENSIVE BOARD AUDIT vs ORIGINAL SCREENSHOTS');
console.log('Board ID:', boardId);
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Expected structure from screenshots
const EXPECTED_STRUCTURE = {
  section0: {
    name: "CONTINUOUS DISCOVERY HABITS MASTERCLASS",
    items: {
      agenda: 1,
      flowDiagram: 1,
      examples: 5, // Bottom row examples
      greenStickies: 3,
      yellowStickies: 3
    }
  },
  section1: {
    name: "DEFINING OUTCOMES",
    items: {
      headers: 3,
      businessOutcomes: 3,
      productOutcomes: 6,
      tractionMetrics: 8
    }
  },
  section2: {
    name: "INTERVIEWING",
    items: {
      headers: 5,
      yellowStickies: 25,
      pinkStickies: 6,
      examples: 6
    }
  },
  section3: {
    name: "MAPPING OPPORTUNITIES",
    items: {
      headers: 2,
      greenStickies: 12,
      blueStickies: 3,
      examples: 6
    }
  },
  section4: {
    name: "ASSESSING & PRIORITIZING",
    items: {
      priorityScale: 13, // Colored dots at top
      headers: 2,
      ideationGrids: 6,
      yellowStickies: 150, // 6 grids x 25
      colorLabels: 4,
      examples: 3
    }
  },
  section5: {
    name: "SOLUTION STORY MAPPING",
    items: {
      storyMaps: 3,
      yellowEpics: 30, // 10 per map
      purpleTaskGrids: 108, // 36 per map
      examples: 6
    }
  },
  section6: {
    name: "TESTING ASSUMPTIONS", 
    items: {
      testCanvases: 6,
      darkBlueLabels: 24, // 4 per canvas
      yellowResults: 48, // 8 per canvas
      examples: 10
    }
  }
};

// Color mapping
const COLOR_GROUPS = {
  yellow: ['yellow', 'light_yellow'],
  green: ['green', 'light_green'],
  purple: ['violet', 'purple'],
  blue: ['blue', 'light_blue'],
  darkBlue: ['dark_blue', 'navy'],
  pink: ['pink', 'light_pink', 'red'],
  gray: ['gray', 'light_gray']
};

function categorizeColor(fillColor) {
  for (const [group, colors] of Object.entries(COLOR_GROUPS)) {
    if (colors.includes(fillColor)) return group;
  }
  return 'other';
}

async function auditBoard() {
  const report = {
    timestamp: new Date().toISOString(),
    sections: {},
    duplicates: [],
    missingElements: [],
    extraElements: [],
    layoutIssues: [],
    colorMismatches: [],
    recommendations: []
  };

  try {
    console.log('\n📊 Phase 1: Collecting Current Board State');
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
    
    // Categorize items
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const shapes = allItems.filter(item => item.type === 'shape');
    const texts = allItems.filter(item => item.type === 'text');
    const images = allItems.filter(item => item.type === 'image');
    const frames = allItems.filter(item => item.type === 'frame');
    
    console.log(`   Sticky Notes: ${stickyNotes.length}`);
    console.log(`   Shapes: ${shapes.length}`);
    console.log(`   Text Items: ${texts.length}`);
    console.log(`   Images: ${images.length}`);
    console.log(`   Frames: ${frames.length}`);
    
    // Check for duplicates
    console.log('\n🔍 Phase 2: Duplicate Detection');
    console.log('─'.repeat(50));
    
    const contentMap = new Map();
    stickyNotes.forEach(item => {
      const key = `${item.data?.content}_${Math.floor(item.position.x / 100)}_${Math.floor(item.position.y / 100)}`;
      if (contentMap.has(key)) {
        report.duplicates.push({
          content: item.data?.content,
          ids: [contentMap.get(key), item.id],
          position: item.position
        });
      } else {
        contentMap.set(key, item.id);
      }
    });
    
    console.log(`   Found ${report.duplicates.length} potential duplicates`);
    
    // Analyze each section
    console.log('\n📐 Phase 3: Section-by-Section Analysis');
    console.log('─'.repeat(50));
    
    for (let sectionIndex = 0; sectionIndex <= 6; sectionIndex++) {
      const sectionX = sectionIndex * 1400;
      const sectionItems = stickyNotes.filter(item => 
        item.position.x >= sectionX && item.position.x < sectionX + 1400
      );
      
      const sectionKey = `section${sectionIndex}`;
      const expected = EXPECTED_STRUCTURE[sectionKey];
      
      console.log(`\n   Section ${sectionIndex}: ${expected.name}`);
      console.log(`   Current items: ${sectionItems.length}`);
      
      // Color analysis
      const colorCounts = {};
      sectionItems.forEach(item => {
        const color = categorizeColor(item.style?.fillColor);
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
      
      report.sections[sectionIndex] = {
        name: expected.name,
        currentCount: sectionItems.length,
        colorDistribution: colorCounts,
        issues: []
      };
      
      // Section-specific checks
      if (sectionIndex === 0) {
        // Check for flow diagram
        const hasFlowDiagram = shapes.some(item => 
          item.position.x >= sectionX && item.position.x < sectionX + 1400
        );
        if (!hasFlowDiagram) {
          report.missingElements.push('Section 0: Flow diagram missing');
          console.log('      ❌ Missing flow diagram');
        }
        
        // Check for examples row
        const bottomRowY = 2000; // Approximate Y position
        const exampleImages = images.filter(item => 
          item.position.x >= sectionX && 
          item.position.x < sectionX + 1400 &&
          item.position.y > bottomRowY
        );
        if (exampleImages.length < 4) {
          report.missingElements.push('Section 0: Examples gallery incomplete');
          console.log(`      ⚠️ Examples: ${exampleImages.length}/5`);
        }
      }
      
      if (sectionIndex === 1) {
        // Check structure: 3 yellow (business), 6 yellow (product), 8 yellow (metrics)
        const yellowCount = colorCounts.yellow || 0;
        if (yellowCount !== 17) {
          report.layoutIssues.push(`Section 1: Expected 17 yellow, found ${yellowCount}`);
          console.log(`      ⚠️ Yellow sticky count: ${yellowCount}/17`);
        }
      }
      
      if (sectionIndex === 2) {
        // Check for interview structure
        const yellowCount = colorCounts.yellow || 0;
        const pinkCount = colorCounts.pink || 0;
        console.log(`      Yellow: ${yellowCount}/25, Pink: ${pinkCount}/6`);
        
        // Check for examples
        const hasExamples = images.some(item => 
          item.position.x >= sectionX && 
          item.position.x < sectionX + 1400 &&
          item.position.y > 2000
        );
        if (!hasExamples) {
          report.missingElements.push('Section 2: Examples gallery missing');
        }
      }
      
      if (sectionIndex === 3) {
        // Check opportunity mapping
        const greenCount = colorCounts.green || 0;
        console.log(`      Green opportunities: ${greenCount}/12`);
        
        if (greenCount < 12) {
          report.layoutIssues.push(`Section 3: Missing ${12 - greenCount} green opportunities`);
        }
      }
      
      if (sectionIndex === 4) {
        // Check for priority scale
        const topRowShapes = shapes.filter(item => 
          item.position.x >= sectionX && 
          item.position.x < sectionX + 1400 &&
          item.position.y < 300
        );
        if (topRowShapes.length < 10) {
          report.missingElements.push('Section 4: Priority scale incomplete');
          console.log(`      ❌ Priority scale: ${topRowShapes.length}/13 dots`);
        }
        
        // Check ideation grids
        const yellowCount = colorCounts.yellow || 0;
        console.log(`      Yellow stickies: ${yellowCount}/150`);
        
        if (yellowCount < 140) {
          report.layoutIssues.push(`Section 4: Ideation grids incomplete (${yellowCount}/150)`);
        }
      }
      
      if (sectionIndex === 5) {
        // Check story maps
        const yellowCount = colorCounts.yellow || 0;
        const purpleCount = colorCounts.purple || 0;
        
        console.log(`      Yellow epics/stories: ${yellowCount}/30`);
        console.log(`      Purple tasks: ${purpleCount}/108`);
        
        if (yellowCount < 25 || purpleCount < 100) {
          report.layoutIssues.push('Section 5: Story maps incomplete');
        }
      }
      
      if (sectionIndex === 6) {
        // Check test canvases
        const darkBlueCount = colorCounts.darkBlue || 0;
        const yellowCount = colorCounts.yellow || 0;
        
        console.log(`      Dark blue labels: ${darkBlueCount}/24`);
        console.log(`      Yellow results: ${yellowCount}/48`);
        
        if (darkBlueCount < 20 || yellowCount < 40) {
          report.layoutIssues.push('Section 6: Test canvases incomplete');
        }
      }
    }
    
    // Check for extra elements
    console.log('\n⚠️ Phase 4: Extra Elements Detection');
    console.log('─'.repeat(50));
    
    const totalExpected = 471;
    const totalCurrent = stickyNotes.length;
    if (totalCurrent > totalExpected + 20) {
      report.extraElements.push(`${totalCurrent - totalExpected} extra sticky notes`);
      console.log(`   ⚠️ ${totalCurrent - totalExpected} extra sticky notes detected`);
    }
    
    // Generate recommendations
    console.log('\n💡 Phase 5: Generating Recommendations');
    console.log('─'.repeat(50));
    
    if (report.duplicates.length > 0) {
      report.recommendations.push(`Remove ${report.duplicates.length} duplicate items`);
    }
    
    if (report.missingElements.length > 0) {
      report.recommendations.push('Add missing visual elements (flow diagrams, examples, priority scale)');
    }
    
    if (report.layoutIssues.length > 0) {
      report.recommendations.push('Reorganize sections to match original structure');
    }
    
    // Priority issues
    const criticalIssues = [];
    if (!shapes.length) criticalIssues.push('No shapes/diagrams found');
    if (!images.length) criticalIssues.push('No example images found');
    if (report.duplicates.length > 10) criticalIssues.push('Many duplicates detected');
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📋 AUDIT SUMMARY');
    console.log('═'.repeat(70));
    
    console.log('\n🔴 Critical Issues:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    
    console.log('\n🟡 Missing Elements:');
    report.missingElements.forEach(element => console.log(`   - ${element}`));
    
    console.log('\n🟠 Layout Issues:');
    report.layoutIssues.forEach(issue => console.log(`   - ${issue}`));
    
    console.log('\n📊 Section Status:');
    Object.entries(report.sections).forEach(([section, data]) => {
      const status = data.issues.length === 0 ? '✅' : '⚠️';
      console.log(`   ${status} Section ${section}: ${data.name} (${data.currentCount} items)`);
    });
    
    console.log('\n💡 Top Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    
    // Save detailed report
    const reportFilename = `comprehensive-audit-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFilename}`);
    
    console.log('\n' + '═'.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run the audit
auditBoard();