#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🚀 REFINED SWARM CLEANUP ORCHESTRATOR');
console.log('Board ID:', boardId);
console.log('Strategy: Conservative organization with validation');
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Layout configuration
const LAYOUT = {
  sectionWidth: 1400,
  stickySize: 100,
  spacing: 110,
  padding: 50,
  headerHeight: 150
};

// Color system
const COLORS = {
  yellow: 'yellow',
  green: 'light_green',
  purple: 'violet',
  darkBlue: 'dark_blue',
  pink: 'light_pink',
  gray: 'gray'
};

// Delay for API rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ===== AGENT DEFINITIONS =====

class ValidationAgent {
  constructor() {
    this.name = 'ValidationAgent';
    this.duplicates = [];
    this.snapshot = [];
  }

  async execute(items) {
    console.log(`\n🔍 ${this.name} starting validation...`);
    
    // Create snapshot
    this.snapshot = items.map(item => ({
      id: item.id,
      type: item.type,
      content: item.data?.content,
      position: item.position,
      color: item.style?.fillColor
    }));
    
    // Find true duplicates (same content AND overlapping position)
    const stickyNotes = items.filter(item => item.type === 'sticky_note');
    
    for (let i = 0; i < stickyNotes.length; i++) {
      for (let j = i + 1; j < stickyNotes.length; j++) {
        const item1 = stickyNotes[i];
        const item2 = stickyNotes[j];
        
        // Check if content is identical
        if (item1.data?.content === item2.data?.content) {
          // Check if positions overlap (within 50px)
          const distance = Math.sqrt(
            Math.pow(item1.position.x - item2.position.x, 2) +
            Math.pow(item1.position.y - item2.position.y, 2)
          );
          
          if (distance < 50) {
            this.duplicates.push({
              items: [item1.id, item2.id],
              content: item1.data?.content,
              distance: Math.round(distance)
            });
          }
        }
      }
    }
    
    console.log(`   ✓ Found ${this.duplicates.length} true duplicates`);
    console.log(`   ✓ Snapshot created with ${this.snapshot.length} items`);
    
    // Save snapshot
    fs.writeFileSync('board-snapshot.json', JSON.stringify(this.snapshot, null, 2));
    
    return {
      duplicates: this.duplicates,
      snapshot: this.snapshot
    };
  }
}

class ConsolidationAgent {
  constructor() {
    this.name = 'ConsolidationAgent';
    this.consolidated = 0;
  }

  async execute(items, duplicates) {
    console.log(`\n🔄 ${this.name} consolidating duplicates...`);
    
    for (const dup of duplicates) {
      try {
        // Keep first, remove second
        await miroApi.delete(`/boards/${boardId}/sticky_notes/${dup.items[1]}`);
        this.consolidated++;
        await delay(200);
      } catch (error) {
        console.log(`   ⚠️ Could not remove duplicate ${dup.items[1]}`);
      }
    }
    
    console.log(`   ✓ Consolidated ${this.consolidated} duplicate items`);
    
    return { consolidated: this.consolidated };
  }
}

class LayoutEngineer {
  constructor() {
    this.name = 'LayoutEngineer';
    this.fixed = 0;
  }

  async execute(items) {
    console.log(`\n📐 ${this.name} fixing layouts...`);
    
    const stickyNotes = items.filter(item => item.type === 'sticky_note');
    
    // Fix Section 4: Ideation Grids
    console.log('   Fixing Section 4 ideation grids...');
    const section4Items = stickyNotes.filter(item => {
      const x = item.position.x;
      return x >= 4 * LAYOUT.sectionWidth && x < 5 * LAYOUT.sectionWidth;
    });
    
    // Organize into 6 grids (5x5 each)
    for (let i = 0; i < section4Items.length && i < 150; i++) {
      const gridIndex = Math.floor(i / 25);
      const itemInGrid = i % 25;
      const gridRow = Math.floor(gridIndex / 2);
      const gridCol = gridIndex % 2;
      
      const row = Math.floor(itemInGrid / 5);
      const col = itemInGrid % 5;
      
      const newPos = {
        x: (4 * LAYOUT.sectionWidth) + LAYOUT.padding + (gridCol * 700) + (col * 120),
        y: LAYOUT.headerHeight + 100 + (gridRow * 700) + (row * 120)
      };
      
      try {
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${section4Items[i].id}`, {
          position: newPos
        });
        this.fixed++;
        
        if (i % 10 === 0) {
          process.stdout.write(`\r      Progress: ${i}/${section4Items.length} items`);
          await delay(300);
        }
      } catch (error) {
        // Continue on error
      }
    }
    
    console.log(`\n   ✓ Fixed ${this.fixed} items in Section 4`);
    
    // Fix Section 5: Story Maps
    console.log('   Fixing Section 5 story maps...');
    const section5Items = stickyNotes.filter(item => {
      const x = item.position.x;
      return x >= 5 * LAYOUT.sectionWidth && x < 6 * LAYOUT.sectionWidth;
    });
    
    // Separate by color
    const yellows = section5Items.filter(item => 
      item.style?.fillColor === 'yellow' || item.style?.fillColor === 'light_yellow'
    );
    const purples = section5Items.filter(item => 
      item.style?.fillColor === 'violet' || item.style?.fillColor === 'purple'
    );
    
    // Create 3 story maps
    const mapsToCreate = Math.min(3, Math.ceil(yellows.length / 10));
    
    for (let mapIndex = 0; mapIndex < mapsToCreate; mapIndex++) {
      const mapStartY = LAYOUT.headerHeight + (mapIndex * 900);
      
      // Position yellow epics/stories (10 per map)
      for (let i = 0; i < 10; i++) {
        const yellowIndex = (mapIndex * 10) + i;
        if (yellowIndex < yellows.length) {
          const row = Math.floor(i / 5);
          const col = i % 5;
          
          const newPos = {
            x: (5 * LAYOUT.sectionWidth) + LAYOUT.padding + (col * 130),
            y: mapStartY + (row * 120)
          };
          
          try {
            await miroApi.patch(`/boards/${boardId}/sticky_notes/${yellows[yellowIndex].id}`, {
              position: newPos
            });
            this.fixed++;
            await delay(200);
          } catch (error) {
            // Continue
          }
        }
      }
      
      // Position purple tasks (36 per map in 6x6 grid)
      for (let i = 0; i < 36; i++) {
        const purpleIndex = (mapIndex * 36) + i;
        if (purpleIndex < purples.length) {
          const row = Math.floor(i / 6);
          const col = i % 6;
          
          const newPos = {
            x: (5 * LAYOUT.sectionWidth) + LAYOUT.padding + (col * 110),
            y: mapStartY + 280 + (row * 110)
          };
          
          try {
            await miroApi.patch(`/boards/${boardId}/sticky_notes/${purples[purpleIndex].id}`, {
              position: newPos
            });
            this.fixed++;
            
            if (purpleIndex % 10 === 0) {
              process.stdout.write(`\r      Story Map ${mapIndex + 1}: ${i}/36 tasks positioned`);
              await delay(200);
            }
          } catch (error) {
            // Continue
          }
        }
      }
    }
    
    console.log(`\n   ✓ Fixed ${this.fixed} total items`);
    
    return { fixed: this.fixed };
  }
}

class PlaceholderCreator {
  constructor() {
    this.name = 'PlaceholderCreator';
    this.created = 0;
  }

  async execute() {
    console.log(`\n🎨 ${this.name} creating visual elements...`);
    
    // Add Section 0 flow diagram placeholder
    console.log('   Creating Section 0 flow diagram...');
    
    try {
      // Create central shape for flow diagram
      await miroApi.post(`/boards/${boardId}/shapes`, {
        data: {
          shape: 'rectangle',
          content: '<p>Continuous Discovery Flow</p>'
        },
        style: {
          fillColor: '#ffffff',
          fillOpacity: 0.1,
          borderColor: '#1a1a1a',
          borderWidth: 2,
          borderOpacity: 1,
          fontSize: 16,
          textAlign: 'center',
          textAlignVertical: 'middle'
        },
        position: {
          x: 350,
          y: 400
        },
        geometry: {
          width: 600,
          height: 400
        }
      });
      this.created++;
      
      await delay(500);
      
      // Add nodes around the flow
      const nodes = [
        { x: 200, y: 300, text: 'Define\nOutcomes' },
        { x: 500, y: 300, text: 'Continuous\nInterviewing' },
        { x: 800, y: 300, text: 'Map\nOpportunities' },
        { x: 200, y: 600, text: 'Prioritize' },
        { x: 500, y: 600, text: 'Test\nAssumptions' },
        { x: 800, y: 600, text: 'Story\nMapping' }
      ];
      
      for (const node of nodes) {
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: {
            content: node.text,
            shape: 'square'
          },
          style: {
            fillColor: 'light_green'
          },
          position: node
        });
        this.created++;
        await delay(300);
      }
    } catch (error) {
      console.log('   ⚠️ Could not create flow diagram');
    }
    
    // Add priority scale for Section 4
    console.log('   Creating Section 4 priority scale...');
    
    const priorityColors = [
      '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00',
      '#FFFF00', '#CCFF00', '#99FF00', '#66FF00', '#33FF00',
      '#00FF00', '#00FF66', '#00FFCC'
    ];
    
    for (let i = 0; i < priorityColors.length; i++) {
      try {
        await miroApi.post(`/boards/${boardId}/shapes`, {
          data: {
            shape: 'circle'
          },
          style: {
            fillColor: priorityColors[i],
            borderWidth: 1
          },
          position: {
            x: (4 * LAYOUT.sectionWidth) + 200 + (i * 60),
            y: 100
          },
          geometry: {
            width: 40,
            height: 40
          }
        });
        this.created++;
        await delay(200);
      } catch (error) {
        // Use default colors if custom fails
        break;
      }
    }
    
    // Add example placeholders
    console.log('   Creating example galleries...');
    
    const exampleSections = [
      { section: 0, count: 5, y: 2200 },
      { section: 2, count: 6, y: 2200 },
      { section: 3, count: 6, y: 2200 },
      { section: 4, count: 3, y: 2400 },
      { section: 5, count: 6, y: 3200 },
      { section: 6, count: 10, y: 2000 }
    ];
    
    for (const example of exampleSections) {
      for (let i = 0; i < example.count; i++) {
        try {
          await miroApi.post(`/boards/${boardId}/shapes`, {
            data: {
              shape: 'rectangle',
              content: `<p>Example ${i + 1}</p>`
            },
            style: {
              fillColor: '#e6e6e6',
              borderColor: '#999999',
              borderWidth: 1,
              fontSize: 12,
              textAlign: 'center'
            },
            position: {
              x: (example.section * LAYOUT.sectionWidth) + 100 + (i * 200),
              y: example.y
            },
            geometry: {
              width: 180,
              height: 120
            }
          });
          this.created++;
          
          if (this.created % 5 === 0) {
            await delay(500);
          }
        } catch (error) {
          // Continue on error
        }
      }
    }
    
    console.log(`   ✓ Created ${this.created} visual elements`);
    
    return { created: this.created };
  }
}

class StructuralArchitect {
  constructor() {
    this.name = 'StructuralArchitect';
    this.added = 0;
  }

  async execute() {
    console.log(`\n🏗️ ${this.name} adding structure...`);
    
    // Add section headers
    const sections = [
      '0. CONTINUOUS DISCOVERY HABITS MASTERCLASS',
      '1. DEFINING OUTCOMES',
      '2. INTERVIEWING',
      '3. MAPPING OPPORTUNITIES',
      '4. ASSESSING & PRIORITIZING',
      '5. SOLUTION STORY MAPPING',
      '6. TESTING ASSUMPTIONS'
    ];
    
    for (let i = 0; i < sections.length; i++) {
      try {
        await miroApi.post(`/boards/${boardId}/text`, {
          data: {
            content: sections[i]
          },
          style: {
            fontSize: 24,
            textAlign: 'left'
          },
          position: {
            x: (i * LAYOUT.sectionWidth) + 50,
            y: 20
          },
          geometry: {
            width: 1200
          }
        });
        this.added++;
        await delay(300);
      } catch (error) {
        console.log(`   ⚠️ Could not add header for section ${i}`);
      }
    }
    
    // Add section frames
    console.log('   Adding section frames...');
    
    for (let i = 0; i < 7; i++) {
      try {
        await miroApi.post(`/boards/${boardId}/frames`, {
          data: {
            title: sections[i],
            type: 'freeform'
          },
          style: {
            fillColor: '#ffffff'
          },
          position: {
            x: i * LAYOUT.sectionWidth,
            y: 0
          },
          geometry: {
            width: LAYOUT.sectionWidth - 50,
            height: 3000
          }
        });
        this.added++;
        await delay(500);
      } catch (error) {
        // Frames might not be supported
        break;
      }
    }
    
    console.log(`   ✓ Added ${this.added} structural elements`);
    
    return { added: this.added };
  }
}

class QualityInspector {
  constructor() {
    this.name = 'QualityInspector';
  }

  async execute() {
    console.log(`\n✅ ${this.name} running final verification...`);
    
    // Get current state
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
    
    // Check metrics
    const stickyNotes = allItems.filter(item => item.type === 'sticky_note');
    const shapes = allItems.filter(item => item.type === 'shape');
    const texts = allItems.filter(item => item.type === 'text');
    
    // Check for overlaps
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
    
    const report = {
      totalItems: allItems.length,
      stickyNotes: stickyNotes.length,
      shapes: shapes.length,
      texts: texts.length,
      overlaps: overlaps,
      grade: overlaps === 0 && stickyNotes.length > 450 ? 'A' : 
             overlaps < 10 && stickyNotes.length > 400 ? 'B' : 
             overlaps < 25 ? 'C' : 'D'
    };
    
    console.log('   ╔══════════════════════════════════════╗');
    console.log('   ║       FINAL QUALITY REPORT           ║');
    console.log('   ╠══════════════════════════════════════╣');
    console.log(`   ║ Total Items:        ${String(report.totalItems).padEnd(17)}║`);
    console.log(`   ║ Sticky Notes:       ${String(report.stickyNotes).padEnd(17)}║`);
    console.log(`   ║ Shapes:             ${String(report.shapes).padEnd(17)}║`);
    console.log(`   ║ Text Items:         ${String(report.texts).padEnd(17)}║`);
    console.log(`   ║ Overlapping Pairs:  ${String(report.overlaps).padEnd(17)}║`);
    console.log(`   ║ Quality Grade:      ${report.grade.padEnd(17)}║`);
    console.log('   ╚══════════════════════════════════════╝');
    
    return report;
  }
}

// ===== MAIN ORCHESTRATOR =====

async function runSwarmCleanup() {
  console.log('\n🐝 SWARM INITIALIZATION');
  console.log('─'.repeat(50));
  
  // Initialize agents
  const agents = {
    validation: new ValidationAgent(),
    consolidation: new ConsolidationAgent(),
    layout: new LayoutEngineer(),
    placeholder: new PlaceholderCreator(),
    structure: new StructuralArchitect(),
    quality: new QualityInspector()
  };
  
  console.log('   ✓ 6 specialized agents ready');
  console.log('   ✓ Conservative strategy loaded');
  console.log('   ✓ Validation-first approach');
  
  try {
    // Get current board state
    console.log('\n📊 COLLECTING BOARD STATE');
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
    }
    
    console.log(`   ✓ Collected ${allItems.length} items`);
    
    // Phase 0: Validation
    console.log('\n═══ PHASE 0: VALIDATION ═══');
    const validationResult = await agents.validation.execute(allItems);
    
    // Phase 1: Consolidation
    console.log('\n═══ PHASE 1: CONSOLIDATION ═══');
    const consolidationResult = await agents.consolidation.execute(allItems, validationResult.duplicates);
    
    // Refresh items after consolidation
    if (consolidationResult.consolidated > 0) {
      allItems = [];
      cursor = null;
      hasMore = true;
      
      while (hasMore) {
        const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
        const response = await miroApi.get(`/boards/${boardId}/items`, { params });
        
        allItems = allItems.concat(response.data.data || []);
        cursor = response.data.cursor;
        hasMore = !!cursor;
      }
    }
    
    // Phase 2: Layout Engineering
    console.log('\n═══ PHASE 2: LAYOUT ENGINEERING ═══');
    const layoutResult = await agents.layout.execute(allItems);
    
    // Phase 3: Visual Elements
    console.log('\n═══ PHASE 3: VISUAL ELEMENTS ═══');
    const placeholderResult = await agents.placeholder.execute();
    
    // Phase 4: Structure
    console.log('\n═══ PHASE 4: STRUCTURAL ELEMENTS ═══');
    const structureResult = await agents.structure.execute();
    
    // Phase 5: Final Verification
    console.log('\n═══ PHASE 5: QUALITY INSPECTION ═══');
    const qualityReport = await agents.quality.execute();
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 SWARM CLEANUP COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Execution Summary:');
    console.log(`   Duplicates removed: ${consolidationResult.consolidated}`);
    console.log(`   Items repositioned: ${layoutResult.fixed}`);
    console.log(`   Visual elements added: ${placeholderResult.created}`);
    console.log(`   Structural elements: ${structureResult.added}`);
    console.log(`   Final quality grade: ${qualityReport.grade}`);
    
    console.log('\n🔗 View improved board:');
    console.log(`   https://miro.com/app/board/${boardId}/`);
    
    // Save final report
    const finalReport = {
      timestamp: new Date().toISOString(),
      phases: {
        validation: validationResult,
        consolidation: consolidationResult,
        layout: layoutResult,
        placeholder: placeholderResult,
        structure: structureResult
      },
      quality: qualityReport
    };
    
    fs.writeFileSync('swarm-cleanup-report.json', JSON.stringify(finalReport, null, 2));
    console.log('\n💾 Full report saved to: swarm-cleanup-report.json');
    
  } catch (error) {
    console.error('\n❌ Swarm Error:', error.message);
    console.error(error.response ? error.response.data : error);
  }
}

// Execute the swarm
runSwarmCleanup();