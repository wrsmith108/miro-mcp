#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 COMPREHENSIVE DIFFERENCE AUDIT');
console.log('Board ID:', boardId);
console.log('Comparing against original screenshots');
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Expected structure based on detailed screenshot analysis
const ORIGINAL_STRUCTURE = {
  section0: {
    name: "0. CONTINUOUS DISCOVERY HABITS MASTERCLASS",
    expectedItems: {
      agenda: { count: 1, type: 'panel', content: '6 class schedule' },
      flowDiagram: { count: 1, type: 'diagram', content: 'Continuous Discovery flow with nodes' },
      greenNodes: { count: 3, type: 'sticky_note', color: 'green' },
      yellowNodes: { count: 3, type: 'sticky_note', color: 'yellow' },
      logoElements: { count: 4, type: 'image', content: 'Slack, Product Talk logos' },
      examples: { count: 1, type: 'panel', content: 'example box' }
    },
    totalExpected: 13
  },
  section1: {
    name: "1. DEFINING OUTCOMES",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'EVIDENCE-BASED TEAM DECISIONS' },
      businessOutcomes: { count: 3, type: 'sticky_note', color: 'yellow', label: 'BUSINESS OUTCOMES' },
      productOutcomes: { count: 6, type: 'sticky_note', color: 'yellow', label: 'PRODUCT OUTCOMES' },
      tractionMetrics: { count: 8, type: 'sticky_note', color: 'yellow', label: 'TRACTION METRICS' }
    },
    totalExpected: 18
  },
  section2: {
    name: "2. INTERVIEWING",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'CONTINUOUS INTERVIEWING' },
      interviewRows: [
        { label: 'WHO TO INTERVIEW', yellows: 5 },
        { label: 'HOW TO RECRUIT', yellows: 5 },
        { label: 'WHEN TO INTERVIEW', yellows: 5 },
        { label: 'HOW TO INTERVIEW', yellows: 5 },
        { label: 'WHAT TO CAPTURE', yellows: 5 }
      ],
      pinkNotes: { count: 6, type: 'sticky_note', color: 'pink' },
      examples: { count: 6, type: 'panel' }
    },
    totalYellow: 25,
    totalPink: 6,
    totalExpected: 31
  },
  section3: {
    name: "3. MAPPING OPPORTUNITIES",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'MAPPING OPPORTUNITIES' },
      greenOpportunities: { count: 12, type: 'sticky_note', color: 'green' },
      blueNodes: { count: 3, type: 'sticky_note', color: 'blue' },
      hierarchyStructure: true,
      examples: { count: 6, type: 'panel' }
    },
    totalExpected: 16
  },
  section4: {
    name: "4. ASSESSING & PRIORITIZING",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'ASSESSING & PRIORITIZING OPPORTUNITIES' },
      priorityScale: { count: 13, type: 'shape', colors: 'gradient red to green' },
      categoryLabels: { count: 4, type: 'sticky_note', colors: ['blue', 'green', 'yellow', 'pink'] },
      ideationGrids: {
        count: 6,
        structure: '2x3 layout',
        itemsPerGrid: 25,
        totalYellow: 150
      },
      examples: { count: 3, type: 'panel' }
    },
    totalExpected: 167
  },
  section5: {
    name: "5. SOLUTION STORY MAPPING",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'STORY MAPPING' },
      storyMaps: {
        count: 3,
        structure: 'vertical layout',
        perMap: {
          yellowEpics: 10,
          purpleTasks: 36
        }
      },
      totalYellow: 30,
      totalPurple: 108,
      examples: { count: 6, type: 'panel' }
    },
    totalExpected: 138
  },
  section6: {
    name: "6. TESTING ASSUMPTIONS",
    expectedItems: {
      header: { count: 1, type: 'text', content: 'TESTING ASSUMPTIONS' },
      testCanvases: {
        count: 6,
        structure: '2x3 layout',
        perCanvas: {
          darkBlueLabels: 4,
          yellowResults: 8
        }
      },
      totalDarkBlue: 24,
      totalYellow: 48,
      examples: { count: 10, type: 'panel' }
    },
    totalExpected: 72
  },
  examplesGallery: {
    name: "EXAMPLES",
    sections: 7,
    totalImages: 36
  }
};

async function performDifferenceAudit() {
  const report = {
    timestamp: new Date().toISOString(),
    boardId: boardId,
    sections: {},
    differences: {
      missing: [],
      extra: [],
      misaligned: [],
      colorMismatches: []
    },
    metrics: {
      expectedTotal: 471,
      currentTotal: 0,
      completeness: 0
    },
    priorityFixes: [],
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
    
    report.metrics.currentTotal = stickyNotes.length;
    
    console.log(`   Sticky Notes: ${stickyNotes.length}`);
    console.log(`   Shapes: ${shapes.length}`);
    console.log(`   Text Items: ${texts.length}`);
    console.log(`   Images: ${images.length}`);
    console.log(`   Frames: ${frames.length}`);
    
    // Phase 2: Section-by-section comparison
    console.log('\n📐 Phase 2: Section-by-Section Comparison');
    console.log('─'.repeat(50));
    
    for (let sectionIndex = 0; sectionIndex <= 6; sectionIndex++) {
      const sectionX = sectionIndex * 1400;
      const sectionKey = `section${sectionIndex}`;
      const expected = ORIGINAL_STRUCTURE[sectionKey];
      
      console.log(`\n   Section ${sectionIndex}: ${expected.name}`);
      
      // Get items in this section
      const sectionStickies = stickyNotes.filter(item => 
        item.position.x >= sectionX && item.position.x < sectionX + 1400
      );
      const sectionShapes = shapes.filter(item =>
        item.position.x >= sectionX && item.position.x < sectionX + 1400
      );
      const sectionTexts = texts.filter(item =>
        item.position.x >= sectionX && item.position.x < sectionX + 1400
      );
      
      // Color analysis
      const colorCounts = {};
      sectionStickies.forEach(item => {
        const color = item.style?.fillColor || 'unknown';
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
      
      report.sections[sectionIndex] = {
        name: expected.name,
        current: {
          stickies: sectionStickies.length,
          shapes: sectionShapes.length,
          texts: sectionTexts.length,
          colors: colorCounts
        },
        expected: expected,
        differences: []
      };
      
      // Section-specific checks
      if (sectionIndex === 0) {
        // Check for flow diagram
        const hasFlowDiagram = sectionShapes.length > 0 || 
                               sectionStickies.some(s => s.position.y > 250 && s.position.y < 700);
        if (!hasFlowDiagram) {
          report.differences.missing.push('Section 0: Continuous Discovery flow diagram');
        }
        
        // Check for green/yellow nodes
        const greenCount = colorCounts['light_green'] || colorCounts['green'] || 0;
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        
        if (greenCount < 3) {
          report.differences.missing.push(`Section 0: ${3 - greenCount} green nodes`);
        }
        if (yellowCount < 3) {
          report.differences.missing.push(`Section 0: ${3 - yellowCount} yellow nodes`);
        }
        
        console.log(`      Current: ${sectionStickies.length} stickies (${greenCount} green, ${yellowCount} yellow)`);
        console.log(`      Expected: ~10 items including flow diagram`);
      }
      
      if (sectionIndex === 1) {
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        const expectedYellow = 17;
        
        if (yellowCount !== expectedYellow) {
          report.differences.misaligned.push(
            `Section 1: Has ${yellowCount} yellow, expected ${expectedYellow}`
          );
        }
        
        console.log(`      Current: ${yellowCount} yellow stickies`);
        console.log(`      Expected: ${expectedYellow} (3 business + 6 product + 8 metrics)`);
      }
      
      if (sectionIndex === 2) {
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        const pinkCount = colorCounts['pink'] || colorCounts['light_pink'] || colorCounts['red'] || 0;
        
        if (yellowCount !== 25) {
          report.differences.misaligned.push(
            `Section 2: Has ${yellowCount} yellow, expected 25`
          );
        }
        if (pinkCount !== 6) {
          report.differences.missing.push(
            `Section 2: Has ${pinkCount} pink, expected 6`
          );
        }
        
        console.log(`      Current: ${yellowCount} yellow, ${pinkCount} pink`);
        console.log(`      Expected: 25 yellow, 6 pink`);
      }
      
      if (sectionIndex === 3) {
        const greenCount = colorCounts['light_green'] || colorCounts['green'] || 0;
        const blueCount = colorCounts['blue'] || colorCounts['light_blue'] || 0;
        
        if (greenCount < 12) {
          report.differences.missing.push(
            `Section 3: ${12 - greenCount} green opportunities missing`
          );
        }
        if (blueCount < 3) {
          report.differences.missing.push(
            `Section 3: ${3 - blueCount} blue nodes missing`
          );
        }
        
        console.log(`      Current: ${greenCount} green, ${blueCount} blue`);
        console.log(`      Expected: 12 green, 3 blue`);
      }
      
      if (sectionIndex === 4) {
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        const expectedYellow = 150;
        
        // Check for priority scale
        const priorityDots = sectionShapes.filter(s => s.data?.shape === 'circle');
        if (priorityDots.length < 13) {
          report.differences.missing.push(
            `Section 4: Priority scale incomplete (${priorityDots.length}/13 dots)`
          );
        }
        
        if (yellowCount < expectedYellow) {
          report.differences.missing.push(
            `Section 4: ${expectedYellow - yellowCount} yellow stickies missing`
          );
        }
        
        console.log(`      Current: ${yellowCount} yellow, ${priorityDots.length} priority dots`);
        console.log(`      Expected: 150 yellow in 6 grids, 13 priority dots`);
      }
      
      if (sectionIndex === 5) {
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        const purpleCount = colorCounts['violet'] || colorCounts['purple'] || 0;
        
        if (yellowCount !== 30 && yellowCount !== 68) {
          report.differences.misaligned.push(
            `Section 5: Has ${yellowCount} yellow, expected 30 for 3 maps`
          );
        }
        if (purpleCount !== 108 && purpleCount !== 138) {
          report.differences.misaligned.push(
            `Section 5: Has ${purpleCount} purple, expected 108 for 3 maps`
          );
        }
        
        console.log(`      Current: ${yellowCount} yellow, ${purpleCount} purple`);
        console.log(`      Expected: 30 yellow (10 per map), 108 purple (36 per map)`);
      }
      
      if (sectionIndex === 6) {
        const darkBlueCount = colorCounts['dark_blue'] || colorCounts['navy'] || 0;
        const yellowCount = colorCounts['yellow'] || colorCounts['light_yellow'] || 0;
        
        if (darkBlueCount < 24) {
          report.differences.missing.push(
            `Section 6: ${24 - darkBlueCount} dark blue labels missing`
          );
        }
        if (yellowCount < 48) {
          report.differences.missing.push(
            `Section 6: ${48 - yellowCount} yellow results missing`
          );
        }
        
        console.log(`      Current: ${darkBlueCount} dark blue, ${yellowCount} yellow`);
        console.log(`      Expected: 24 dark blue (4 per canvas), 48 yellow (8 per canvas)`);
      }
    }
    
    // Phase 3: Check examples gallery
    console.log('\n🖼️ Phase 3: Examples Gallery Check');
    console.log('─'.repeat(50));
    
    const exampleImages = images.length;
    const exampleShapes = shapes.filter(s => 
      s.data?.content?.toLowerCase()?.includes('example') ||
      s.position.y > 2000
    );
    
    console.log(`   Current: ${exampleImages} images, ${exampleShapes.length} placeholder shapes`);
    console.log(`   Expected: 36 example images across 7 sections`);
    
    if (exampleImages < 36) {
      report.differences.missing.push(
        `Examples Gallery: ${36 - exampleImages} images missing`
      );
    }
    
    // Phase 4: Calculate completeness
    console.log('\n📊 Phase 4: Completeness Analysis');
    console.log('─'.repeat(50));
    
    report.metrics.completeness = Math.round(
      (report.metrics.currentTotal / report.metrics.expectedTotal) * 100
    );
    
    console.log(`   Total sticky notes: ${report.metrics.currentTotal}/${report.metrics.expectedTotal}`);
    console.log(`   Completeness: ${report.metrics.completeness}%`);
    
    // Phase 5: Priority fixes
    console.log('\n🎯 Phase 5: Prioritizing Fixes');
    console.log('─'.repeat(50));
    
    // Priority 1: Critical missing elements
    if (report.differences.missing.some(m => m.includes('flow diagram'))) {
      report.priorityFixes.push({
        priority: 1,
        section: 0,
        action: 'Create Continuous Discovery flow diagram',
        impact: 'Core visual element'
      });
    }
    
    if (report.differences.missing.some(m => m.includes('Priority scale'))) {
      report.priorityFixes.push({
        priority: 1,
        section: 4,
        action: 'Complete priority scale (13 colored dots)',
        impact: 'Key assessment tool'
      });
    }
    
    // Priority 2: Content gaps
    report.differences.missing.forEach(missing => {
      if (missing.includes('yellow stickies missing')) {
        const match = missing.match(/Section (\d): (\d+) yellow/);
        if (match) {
          report.priorityFixes.push({
            priority: 2,
            section: parseInt(match[1]),
            action: `Add ${match[2]} yellow sticky notes`,
            impact: 'Content completeness'
          });
        }
      }
    });
    
    // Priority 3: Visual enhancements
    if (exampleImages === 0) {
      report.priorityFixes.push({
        priority: 3,
        section: 'all',
        action: 'Add example images or improved placeholders',
        impact: 'Visual reference'
      });
    }
    
    // Sort by priority
    report.priorityFixes.sort((a, b) => a.priority - b.priority);
    
    console.log(`   Identified ${report.priorityFixes.length} priority fixes`);
    report.priorityFixes.slice(0, 5).forEach(fix => {
      console.log(`      P${fix.priority}: ${fix.action}`);
    });
    
    // Generate recommendations
    console.log('\n💡 Phase 6: Generating Recommendations');
    console.log('─'.repeat(50));
    
    report.recommendations = [
      'IMMEDIATE ACTIONS:',
      '1. Create Section 0 flow diagram with 6 connected nodes',
      '2. Add Section 4 priority scale (13 gradient dots)',
      '3. Complete Section 4 ideation grids (add missing yellows)',
      '',
      'CONTENT ALIGNMENT:',
      '4. Adjust Section 5 to exactly 3 story maps (30 yellow + 108 purple)',
      '5. Add missing pink notes to Section 2 (interview insights)',
      '6. Add blue nodes to Section 3 (opportunity hierarchy)',
      '',
      'VISUAL ENHANCEMENTS:',
      '7. Create example placeholders for each section',
      '8. Add section header labels where missing',
      '9. Ensure proper color consistency'
    ];
    
    // Save report
    const reportFilename = `difference-report-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📋 DIFFERENCE REPORT SUMMARY');
    console.log('═'.repeat(70));
    
    console.log('\n🔴 Critical Missing Elements:');
    report.differences.missing.slice(0, 5).forEach(item => {
      console.log(`   - ${item}`);
    });
    
    console.log('\n🟡 Alignment Issues:');
    report.differences.misaligned.slice(0, 5).forEach(item => {
      console.log(`   - ${item}`);
    });
    
    console.log('\n📊 Section Completeness:');
    Object.entries(report.sections).forEach(([idx, section]) => {
      const current = section.current.stickies;
      const status = current > 0 ? 
        (section.differences.length === 0 ? '✅' : '⚠️') : '❌';
      console.log(`   ${status} Section ${idx}: ${current} items`);
    });
    
    console.log('\n🎯 Top Priority Actions:');
    report.priorityFixes.slice(0, 5).forEach((fix, i) => {
      console.log(`   ${i + 1}. ${fix.action}`);
    });
    
    console.log(`\n💾 Full report saved to: ${reportFilename}`);
    console.log(`\n🔗 Board URL: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run the audit
performDifferenceAudit();