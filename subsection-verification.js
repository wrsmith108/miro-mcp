#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 SUBSECTION TITLE VERIFICATION');
console.log('Board ID:', boardId);
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Complete subsection structure from screenshots
const SUBSECTION_STRUCTURE = {
  section0: {
    name: '0. CONTINUOUS DISCOVERY HABITS MASTERCLASS',
    subsections: [
      { title: 'AGENDA', type: 'dark_panel', position: { x: 50, y: 100 } },
      { title: 'Continuous Discovery', type: 'flow_diagram_label', position: { x: 350, y: 350 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 50, y: 2000 } }
    ]
  },
  section1: {
    name: '1. DEFINING OUTCOMES',
    subsections: [
      { title: '1. EVIDENCE-BASED TEAM DECISIONS, DEFINING OUTCOMES', type: 'header', position: { x: 1450, y: 50 } },
      { title: 'BUSINESS OUTCOMES', type: 'dark_panel', position: { x: 1450, y: 250 } },
      { title: 'PRODUCT OUTCOMES', type: 'dark_panel', position: { x: 1450, y: 450 } },
      { title: 'TRACTION METRICS', type: 'dark_panel', position: { x: 1450, y: 650 } }
    ]
  },
  section2: {
    name: '2. INTERVIEWING',
    subsections: [
      { title: '2. CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES', type: 'header', position: { x: 2850, y: 50 } },
      { title: 'WHO TO INTERVIEW', type: 'dark_panel', position: { x: 2850, y: 350 } },
      { title: 'HOW TO RECRUIT', type: 'dark_panel', position: { x: 2850, y: 550 } },
      { title: 'WHEN TO INTERVIEW', type: 'dark_panel', position: { x: 2850, y: 750 } },
      { title: 'HOW TO INTERVIEW', type: 'dark_panel', position: { x: 2850, y: 950 } },
      { title: 'WHAT TO CAPTURE', type: 'dark_panel', position: { x: 2850, y: 1150 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 2850, y: 2000 } }
    ]
  },
  section3: {
    name: '3. MAPPING OPPORTUNITIES',
    subsections: [
      { title: '3. MAPPING OPPORTUNITIES', type: 'header', position: { x: 4250, y: 50 } },
      { title: 'OPPORTUNITY SOLUTION TREE', type: 'label', position: { x: 4250, y: 150 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 4250, y: 2000 } }
    ]
  },
  section4: {
    name: '4. ASSESSING & PRIORITIZING',
    subsections: [
      { title: '4. ASSESSING & PRIORITIZING OPPORTUNITIES, EFFECTIVE SOLUTION IDEATION', type: 'header', position: { x: 5650, y: 50 } },
      { title: 'CONTEXT-DRIVEN PRIORITIZATION', type: 'dark_panel', position: { x: 5650, y: 250 } },
      { title: 'PRIORITIZING OPPORTUNITIES', type: 'dark_panel', position: { x: 5900, y: 350 } },
      { title: 'EFFECTIVE IDEATION', type: 'dark_panel', position: { x: 6150, y: 350 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 5650, y: 2400 } }
    ]
  },
  section5: {
    name: '5. SOLUTION STORY MAPPING',
    subsections: [
      { title: '5. STORY MAPPING, ASSUMPTION MAPPING', type: 'header', position: { x: 7050, y: 50 } },
      { title: 'STORY MAP 1', type: 'label', position: { x: 7050, y: 250 } },
      { title: 'STORY MAP 2', type: 'label', position: { x: 7050, y: 950 } },
      { title: 'STORY MAP 3', type: 'label', position: { x: 7050, y: 1650 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 7050, y: 3200 } }
    ]
  },
  section6: {
    name: '6. TESTING ASSUMPTIONS',
    subsections: [
      { title: '6. TESTING ASSUMPTIONS', type: 'header', position: { x: 8450, y: 50 } },
      { title: 'ASSUMPTION', type: 'dark_panel', position: { x: 8500, y: 350 } },
      { title: 'SIMULATE', type: 'dark_panel', position: { x: 9000, y: 350 } },
      { title: 'EVALUATE', type: 'dark_panel', position: { x: 9500, y: 350 } },
      { title: 'EXAMPLES', type: 'dark_panel', position: { x: 8450, y: 2000 } }
    ]
  }
};

async function verifySubsections() {
  const report = {
    timestamp: new Date().toISOString(),
    totalExpected: 0,
    totalFound: 0,
    missing: [],
    existing: [],
    recommendations: []
  };

  try {
    console.log('\n📊 Phase 1: Collecting Board Items');
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
    
    const textItems = allItems.filter(item => item.type === 'text');
    const shapes = allItems.filter(item => item.type === 'shape');
    
    console.log(`   Text items: ${textItems.length}`);
    console.log(`   Shapes: ${shapes.length}`);
    
    // Phase 2: Check each subsection
    console.log('\n📝 Phase 2: Subsection Verification');
    console.log('─'.repeat(50));
    
    Object.entries(SUBSECTION_STRUCTURE).forEach(([sectionKey, section]) => {
      const sectionNum = sectionKey.replace('section', '');
      console.log(`\n   Section ${sectionNum}: ${section.name}`);
      
      section.subsections.forEach(subsection => {
        report.totalExpected++;
        
        // Check if this subsection exists
        const exists = textItems.some(text => {
          const content = text.data?.content || '';
          return content.includes(subsection.title) ||
                 content.includes(subsection.title.split(' ')[0]);
        }) || shapes.some(shape => {
          const content = shape.data?.content || '';
          return content.includes(subsection.title);
        });
        
        if (exists) {
          report.totalFound++;
          report.existing.push({
            section: sectionNum,
            title: subsection.title,
            type: subsection.type
          });
          console.log(`      ✓ ${subsection.title}`);
        } else {
          report.missing.push({
            section: sectionNum,
            title: subsection.title,
            type: subsection.type,
            position: subsection.position
          });
          console.log(`      ❌ ${subsection.title} (${subsection.type})`);
        }
      });
    });
    
    // Phase 3: Special check for Section 2
    console.log('\n🔍 Phase 3: Section 2 Deep Analysis');
    console.log('─'.repeat(50));
    
    const section2Items = allItems.filter(item => 
      item.position.x >= 2800 && item.position.x < 4200
    );
    
    console.log(`   Total items in Section 2: ${section2Items.length}`);
    console.log(`   Expected subsection headers: 7`);
    console.log(`   Missing subsection headers: ${7 - section2Items.filter(i => i.type === 'text').length}`);
    
    // Generate recommendations
    console.log('\n💡 Phase 4: Generating Recommendations');
    console.log('─'.repeat(50));
    
    if (report.missing.length > 0) {
      // Group missing by type
      const darkPanels = report.missing.filter(m => m.type === 'dark_panel');
      const headers = report.missing.filter(m => m.type === 'header');
      const labels = report.missing.filter(m => m.type === 'label');
      
      if (darkPanels.length > 0) {
        report.recommendations.push({
          priority: 1,
          action: 'Add dark panel subsection headers',
          count: darkPanels.length,
          sections: [...new Set(darkPanels.map(d => d.section))]
        });
      }
      
      if (headers.length > 0) {
        report.recommendations.push({
          priority: 2,
          action: 'Add main section headers',
          count: headers.length,
          sections: [...new Set(headers.map(h => h.section))]
        });
      }
      
      if (labels.length > 0) {
        report.recommendations.push({
          priority: 3,
          action: 'Add descriptive labels',
          count: labels.length,
          sections: [...new Set(labels.map(l => l.section))]
        });
      }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📋 SUBSECTION VERIFICATION SUMMARY');
    console.log('═'.repeat(70));
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Expected subsections: ${report.totalExpected}`);
    console.log(`   Found subsections: ${report.totalFound}`);
    console.log(`   Missing subsections: ${report.missing.length}`);
    console.log(`   Completion rate: ${Math.round((report.totalFound / report.totalExpected) * 100)}%`);
    
    console.log('\n❌ Missing Subsections by Section:');
    for (let i = 0; i <= 6; i++) {
      const sectionMissing = report.missing.filter(m => m.section === String(i));
      if (sectionMissing.length > 0) {
        console.log(`\n   Section ${i}:`);
        sectionMissing.forEach(item => {
          console.log(`      - ${item.title} (${item.type})`);
        });
      }
    }
    
    console.log('\n💡 Priority Actions:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.action}`);
      console.log(`      Count: ${rec.count} | Sections: ${rec.sections.join(', ')}`);
    });
    
    // Save detailed report
    const reportData = {
      ...report,
      detailedStructure: SUBSECTION_STRUCTURE
    };
    
    fs.writeFileSync('subsection-verification-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Full report saved to: subsection-verification-report.json');
    
    return report;
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run verification
verifySubsections();