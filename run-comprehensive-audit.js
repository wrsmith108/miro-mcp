#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 Comprehensive Board Verification');
console.log('Board ID:', boardId);
console.log('Timestamp:', new Date().toISOString());
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Expected metrics from original board
const EXPECTED = {
  totalStickies: 471,
  sections: 7,
  colors: {
    yellow: 308,
    purple: 108,
    green: 23,
    darkBlue: 28,
    pink: 4
  },
  perSection: {
    0: { total: 6, yellow: 3, green: 3 },
    1: { total: 17, yellow: 17 },
    2: { total: 35, yellow: 30, pink: 4, blue: 1 },
    3: { total: 17, green: 16, blue: 1 },
    4: { total: 186, yellow: 180, green: 4, blue: 2 },
    5: { total: 138, yellow: 30, purple: 108 },
    6: { total: 72, yellow: 48, darkBlue: 24 }
  },
  visualElements: {
    flowDiagram: 1,
    priorityDots: 12,
    interviewStructure: 1,
    exampleImages: 30,
    frames: 7
  }
};

async function runComprehensiveAudit() {
  const report = {
    timestamp: new Date().toISOString(),
    boardId: boardId,
    sections: {},
    totals: {
      items: 0,
      stickyNotes: 0,
      texts: 0,
      shapes: 0
    },
    colors: {},
    completion: {},
    issues: [],
    recommendations: []
  };

  try {
    // Step 1: Get ALL items with pagination
    console.log('\n📊 PHASE 1: Data Collection');
    console.log('─'.repeat(50));
    
    let allItems = [];
    let cursor = null;
    let hasMore = true;
    
    while (hasMore) {
      const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      
      allItems = allItems.concat(response.data.data || []);
      cursor = response.data.cursor;
      hasMore = !!cursor;
      
      process.stdout.write(`\r   Fetched ${allItems.length} items...`);
    }
    
    console.log(`\n   ✓ Total items collected: ${allItems.length}`);
    report.totals.items = allItems.length;
    
    // Step 2: Categorize items
    console.log('\n📋 PHASE 2: Item Categorization');
    console.log('─'.repeat(50));
    
    const itemsByType = {};
    const stickyNotes = [];
    
    allItems.forEach(item => {
      // Count by type
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
      
      // Collect sticky notes
      if (item.type === 'sticky_note') {
        stickyNotes.push(item);
        
        // Count colors
        const color = item.style?.fillColor || 'unknown';
        report.colors[color] = (report.colors[color] || 0) + 1;
      }
      
      // Assign to sections based on position
      if (item.position) {
        const sectionIndex = Math.floor(item.position.x / 1400);
        if (sectionIndex >= 0 && sectionIndex <= 6) {
          if (!report.sections[sectionIndex]) {
            report.sections[sectionIndex] = {
              items: [],
              counts: {},
              stickyNotes: 0,
              position: { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
            };
          }
          
          report.sections[sectionIndex].items.push(item);
          report.sections[sectionIndex].counts[item.type] = 
            (report.sections[sectionIndex].counts[item.type] || 0) + 1;
          
          if (item.type === 'sticky_note') {
            report.sections[sectionIndex].stickyNotes++;
          }
          
          // Track boundaries
          const bounds = report.sections[sectionIndex].position;
          bounds.minX = Math.min(bounds.minX, item.position.x);
          bounds.maxX = Math.max(bounds.maxX, item.position.x);
          bounds.minY = Math.min(bounds.minY, item.position.y);
          bounds.maxY = Math.max(bounds.maxY, item.position.y);
        }
      }
    });
    
    report.totals.stickyNotes = stickyNotes.length;
    report.totals.texts = itemsByType.text || 0;
    report.totals.shapes = itemsByType.shape || 0;
    
    console.log('   Item Types:');
    Object.entries(itemsByType).forEach(([type, count]) => {
      console.log(`      ${type}: ${count}`);
    });
    
    // Step 3: Section Analysis
    console.log('\n📍 PHASE 3: Section-by-Section Analysis');
    console.log('─'.repeat(50));
    
    for (let i = 0; i <= 6; i++) {
      const section = report.sections[i] || { stickyNotes: 0, counts: {} };
      const expected = EXPECTED.perSection[i];
      const completion = Math.round((section.stickyNotes / expected.total) * 100);
      
      report.completion[`section${i}`] = completion;
      
      console.log(`\n   Section ${i}:`);
      console.log(`      Expected: ${expected.total} sticky notes`);
      console.log(`      Actual: ${section.stickyNotes} sticky notes`);
      console.log(`      Completion: ${completion}%`);
      
      if (section.counts) {
        console.log('      Items by type:');
        Object.entries(section.counts).forEach(([type, count]) => {
          console.log(`         ${type}: ${count}`);
        });
      }
      
      if (completion < 100) {
        const missing = expected.total - section.stickyNotes;
        report.issues.push(`Section ${i}: Missing ${missing} sticky notes (${100-completion}% incomplete)`);
      }
    }
    
    // Step 4: Color Distribution Analysis
    console.log('\n🎨 PHASE 4: Color Distribution Analysis');
    console.log('─'.repeat(50));
    
    const colorMapping = {
      'yellow': 'yellow',
      'light_green': 'green',
      'violet': 'purple',
      'dark_blue': 'darkBlue',
      'light_pink': 'pink'
    };
    
    console.log('   Expected vs Actual:');
    Object.entries(EXPECTED.colors).forEach(([color, expectedCount]) => {
      let actualCount = 0;
      
      // Map Miro colors to our color names
      Object.entries(report.colors).forEach(([miroColor, count]) => {
        if (colorMapping[miroColor] === color || miroColor === color) {
          actualCount = count;
        }
      });
      
      const percentage = Math.round((actualCount / expectedCount) * 100);
      const status = percentage >= 90 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
      
      console.log(`      ${color}: ${actualCount}/${expectedCount} (${percentage}%) ${status}`);
      
      if (percentage < 90) {
        report.issues.push(`Color ${color}: Only ${percentage}% complete (${actualCount}/${expectedCount})`);
      }
    });
    
    // Step 5: Visual Elements Check
    console.log('\n🎯 PHASE 5: Visual Elements Verification');
    console.log('─'.repeat(50));
    
    const visualChecks = {
      'Flow Diagram': allItems.some(i => i.type === 'connector' || 
        (i.type === 'shape' && i.position?.x < 1400 && i.data?.shape === 'triangle')),
      'Priority Dots': allItems.filter(i => 
        i.type === 'shape' && i.data?.shape === 'circle' && 
        i.geometry?.width === 20).length >= 10,
      'Section Headers': allItems.filter(i => 
        i.type === 'text' && i.data?.content?.includes('CONTINUOUS')).length >= 7,
      'Header Backgrounds': allItems.filter(i => 
        i.type === 'shape' && i.geometry?.width === 1300).length >= 7,
      'Examples Gallery': allItems.some(i => i.type === 'image'),
      'Frames': allItems.filter(i => i.type === 'frame').length
    };
    
    Object.entries(visualChecks).forEach(([element, present]) => {
      const status = present ? '✅' : '❌';
      console.log(`      ${element}: ${status} ${typeof present === 'number' ? `(${present})` : ''}`);
      
      if (!present) {
        report.issues.push(`Missing visual element: ${element}`);
      }
    });
    
    // Step 6: Quality Checks
    console.log('\n✨ PHASE 6: Quality Checks');
    console.log('─'.repeat(50));
    
    // Check for duplicates
    const duplicateCheck = {};
    let duplicates = 0;
    
    allItems.forEach(item => {
      if (item.type === 'text' && item.data?.content) {
        const key = `${item.type}-${item.data.content.substring(0, 50)}`;
        if (duplicateCheck[key]) {
          duplicates++;
        } else {
          duplicateCheck[key] = true;
        }
      }
    });
    
    console.log(`      Duplicate items: ${duplicates > 0 ? `⚠️ ${duplicates} found` : '✅ None'}`);
    if (duplicates > 0) {
      report.issues.push(`Found ${duplicates} duplicate items`);
    }
    
    // Check for overlapping items
    let overlaps = 0;
    for (let i = 0; i < stickyNotes.length; i++) {
      for (let j = i + 1; j < stickyNotes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(stickyNotes[i].position.x - stickyNotes[j].position.x, 2) +
          Math.pow(stickyNotes[i].position.y - stickyNotes[j].position.y, 2)
        );
        if (distance < 50) overlaps++;
      }
    }
    
    console.log(`      Overlapping notes: ${overlaps > 0 ? `⚠️ ${overlaps} pairs` : '✅ None'}`);
    if (overlaps > 0) {
      report.issues.push(`Found ${overlaps} overlapping sticky note pairs`);
    }
    
    // Step 7: Overall Completion
    console.log('\n📊 PHASE 7: Overall Completion Metrics');
    console.log('─'.repeat(50));
    
    const overallCompletion = Math.round((report.totals.stickyNotes / EXPECTED.totalStickies) * 100);
    report.completion.overall = overallCompletion;
    
    console.log(`   Sticky Notes: ${report.totals.stickyNotes}/${EXPECTED.totalStickies} (${overallCompletion}%)`);
    console.log(`   Progress Bar: ${'█'.repeat(Math.floor(overallCompletion/5))}${'░'.repeat(20-Math.floor(overallCompletion/5))} ${overallCompletion}%`);
    
    // Step 8: Recommendations
    console.log('\n💡 PHASE 8: Recommendations');
    console.log('─'.repeat(50));
    
    if (overallCompletion < 100) {
      const missing = EXPECTED.totalStickies - report.totals.stickyNotes;
      report.recommendations.push(`Add ${missing} more sticky notes to reach 100% completion`);
    }
    
    if (duplicates > 0) {
      report.recommendations.push('Run cleanup-duplicates.js to remove duplicate items');
    }
    
    if (!visualChecks['Examples Gallery']) {
      report.recommendations.push('Add examples gallery to bottom of board');
    }
    
    if (!visualChecks['Flow Diagram']) {
      report.recommendations.push('Create flow diagram in Section 0');
    }
    
    // Find sections needing most work
    const incompleteSections = Object.entries(report.completion)
      .filter(([key, value]) => key.startsWith('section') && value < 90)
      .sort((a, b) => a[1] - b[1]);
    
    if (incompleteSections.length > 0) {
      const [worstSection, completion] = incompleteSections[0];
      const sectionNum = worstSection.replace('section', '');
      report.recommendations.push(`Priority: Complete Section ${sectionNum} (currently ${completion}%)`);
    }
    
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    
    // Step 9: Save Report
    console.log('\n💾 PHASE 9: Saving Report');
    console.log('─'.repeat(50));
    
    const reportFilename = `audit-report-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`   ✓ Full report saved to: ${reportFilename}`);
    
    // Step 10: Summary
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('📈 AUDIT SUMMARY');
    console.log('═'.repeat(70));
    
    const grade = overallCompletion >= 95 ? 'A+' :
                  overallCompletion >= 90 ? 'A' :
                  overallCompletion >= 80 ? 'B' :
                  overallCompletion >= 70 ? 'C' :
                  overallCompletion >= 60 ? 'D' : 'F';
    
    console.log(`\n   Overall Grade: ${grade}`);
    console.log(`   Completion: ${overallCompletion}%`);
    console.log(`   Total Items: ${report.totals.items}`);
    console.log(`   Issues Found: ${report.issues.length}`);
    console.log(`   Recommendations: ${report.recommendations.length}`);
    
    if (overallCompletion === 100) {
      console.log('\n   🎉 CONGRATULATIONS! Board is 100% complete!');
    } else {
      console.log(`\n   📝 ${EXPECTED.totalStickies - report.totals.stickyNotes} items remaining to reach 100%`);
    }
    
    console.log('\n' + '═'.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Audit Error:', error.response ? error.response.data : error.message);
    report.issues.push(`Audit error: ${error.message}`);
  }
  
  return report;
}

// Run audit
runComprehensiveAudit();