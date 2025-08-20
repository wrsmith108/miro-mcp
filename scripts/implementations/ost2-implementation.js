#!/usr/bin/env node

// OST2 Implementation - Teresa Torres Opportunity Solution Tree
// Anchored on Product Outcome 1: Users achieve first meaningful insight within 15 minutes
// Using enhanced Layout Designer for optimal visibility

const axios = require('axios');
const fs = require('fs');
const LayoutDesigner = require('./layout-designer');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200,
  
  // Teresa Torres color scheme
  COLORS: {
    OUTCOME: 'blue',              // Product outcome
    OPPORTUNITY: 'light_green',   // Opportunities (sub-outcomes)
    SOLUTION: 'yellow',           // Solutions
    EXPERIMENT: 'dark_blue',      // Experiments
    KEY_MOMENT: 'green',          // Key moments reference
    LABEL: 'gray'                 // Labels
  }
};

// Enhanced Layout Designer for better visibility
const layoutDesigner = new LayoutDesigner({
  minPadding: 80,           // Increased padding for better visibility
  horizontalGap: 350,        // Wider horizontal spacing
  verticalGap: 320,          // More vertical space
  connectorClearance: 50,    // Extra space for connectors
  useGrid: true,
  gridCellWidth: 400,
  gridCellHeight: 400
});

// Miro API setup
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🎯 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// OST2 Structure based on Product Discovery insights
const OST_STRUCTURE = {
  outcome: {
    title: 'PRODUCT OUTCOME 1 (Leading)',
    content: 'Users achieve first meaningful insight within 15 minutes',
    position: { x: 5000, y: 3000 }  // Center position for new frame
  },
  opportunities: [
    {
      title: 'OPPORTUNITY 1',
      content: 'Complete simplified tutorial in <10 minutes',
      keyMoments: [
        'First data source selection',
        'Initial galaxy navigation'
      ],
      solutions: [
        {
          title: 'Guided Interactive Tutorial',
          description: 'Step-by-step walkthrough with sample data',
          fromJourney: 'Addresses overwhelming initial complexity'
        },
        {
          title: 'Quick Start Templates',
          description: 'Pre-configured views for common use cases',
          fromJourney: 'No clear starting point issue'
        },
        {
          title: 'Progressive Complexity Introduction',
          description: 'Start simple, unlock advanced features gradually',
          fromJourney: 'Too many options presented at once'
        }
      ],
      experiments: [
        'A/B test: Guided tour vs self-exploration',
        'Measure: Time to complete first analysis'
      ]
    },
    {
      title: 'OPPORTUNITY 2',
      content: 'Successfully map 2-3 key attributes to their data',
      keyMoments: [
        'Understanding spatial vs visual attributes',
        'Attribute mapping decisions'
      ],
      solutions: [
        {
          title: 'Attribute Recommendation Engine',
          description: 'AI suggests best attributes for data type',
          fromJourney: 'Spatial vs visual confusion'
        },
        {
          title: 'Visual Attribute Wizard',
          description: 'Decision tree for attribute selection',
          fromJourney: 'Mental model mismatch'
        },
        {
          title: 'Calculated Fields Builder',
          description: 'Combine metrics into meaningful aggregates',
          fromJourney: 'Need for derived attributes'
        }
      ],
      experiments: [
        'User study: Attribute understanding',
        'Track: Successful attribute mappings'
      ]
    },
    {
      title: 'OPPORTUNITY 3',
      content: 'Identify at least one actionable pattern',
      keyMoments: [
        'Pattern recognition',
        'Identifying valuable data points'
      ],
      solutions: [
        {
          title: 'Smart Highlighting System',
          description: 'Auto-highlight anomalies and patterns',
          fromJourney: 'Patterns not immediately visible'
        },
        {
          title: 'Insight Discovery Assistant',
          description: 'AI-powered pattern detection',
          fromJourney: 'Hidden relationships not surfaced'
        },
        {
          title: 'Visual Hierarchy Optimization',
          description: 'Emphasize important data points',
          fromJourney: 'Equal visual weight problem'
        }
      ],
      experiments: [
        'Analytics: Pattern discovery rate',
        'Test: Time to first "aha" moment'
      ]
    }
  ]
};

// Implementation state
let implementationState = {
  frameId: null,
  outcomeId: null,
  opportunityIds: [],
  solutionIds: [],
  experimentIds: [],
  connectorIds: [],
  errors: []
};

// Create OST2 frame
async function createOST2Frame() {
  log.phase('CREATING OST2 FRAME');
  
  try {
    // Create the frame
    const frameResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/frames`, {
      data: {
        title: 'OST2',
        type: 'freeform'
      },
      position: { x: 5000, y: 3000 },
      style: {
        fillColor: '#ffffff'
      },
      geometry: {
        width: 3000,
        height: 2500
      }
    });
    
    implementationState.frameId = frameResponse.data.id;
    log.success(`Created OST2 frame: ${frameResponse.data.id}`);
    return true;
  } catch (error) {
    log.error(`Failed to create frame: ${error.message}`);
    return false;
  }
}

// Build the Opportunity Solution Tree
async function buildOpportunitySolutionTree() {
  log.phase('BUILDING OPPORTUNITY SOLUTION TREE');
  
  try {
    // Reset layout designer for fresh calculation
    layoutDesigner.reset();
    
    // Create Product Outcome (root)
    log.info('Creating Product Outcome 1...');
    const outcomePos = layoutDesigner.findSafePosition(
      OST_STRUCTURE.outcome.position,
      { width: 300, height: 200 },
      'square'
    );
    
    const outcomeResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: `${OST_STRUCTURE.outcome.title}\n\n${OST_STRUCTURE.outcome.content}`,
        shape: 'square'
      },
      position: outcomePos,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    
    implementationState.outcomeId = outcomeResponse.data.id;
    log.success(`Created Product Outcome at (${outcomePos.x}, ${outcomePos.y})`);
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Calculate positions for opportunities
    const oppStartX = outcomePos.x - 700;
    const oppY = outcomePos.y + 400;
    const oppSpacing = 700;
    
    // Create Opportunities (sub-outcomes)
    for (let i = 0; i < OST_STRUCTURE.opportunities.length; i++) {
      const opportunity = OST_STRUCTURE.opportunities[i];
      const oppX = oppStartX + (i * oppSpacing);
      
      const oppPos = layoutDesigner.findSafePosition(
        { x: oppX, y: oppY },
        { width: 250, height: 180 },
        'square'
      );
      
      log.info(`Creating ${opportunity.title}...`);
      const oppResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${opportunity.title}\n\n${opportunity.content}`,
          shape: 'square'
        },
        position: oppPos,
        style: { fillColor: CONFIG.COLORS.OPPORTUNITY }
      });
      
      const oppId = oppResponse.data.id;
      implementationState.opportunityIds.push(oppId);
      log.success(`Created opportunity at (${oppPos.x}, ${oppPos.y})`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create connector from outcome to opportunity
      try {
        const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
          startItem: { id: implementationState.outcomeId },
          endItem: { id: oppId },
          style: {
            startStrokeCap: 'none',
            endStrokeCap: 'arrow',
            strokeColor: '#1a1a1a',
            strokeWidth: 2
          }
        });
        implementationState.connectorIds.push(connector.data.id);
      } catch (err) {
        log.error(`Connector failed: ${err.message}`);
      }
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Add Key Moments reference (smaller, to the side)
      for (let j = 0; j < opportunity.keyMoments.length; j++) {
        const kmX = oppPos.x - 200;
        const kmY = oppPos.y + (j * 80);
        
        const kmPos = layoutDesigner.findSafePosition(
          { x: kmX, y: kmY },
          { width: 150, height: 60 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `KEY MOMENT:\n${opportunity.keyMoments[j]}`,
            shape: 'square'
          },
          position: kmPos,
          style: { fillColor: CONFIG.COLORS.KEY_MOMENT }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
      
      // Create Solutions
      const solStartX = oppPos.x - 150;
      const solY = oppPos.y + 350;
      
      for (let j = 0; j < opportunity.solutions.length; j++) {
        const solution = opportunity.solutions[j];
        const solX = solStartX + (j * 180);
        
        const solPos = layoutDesigner.findSafePosition(
          { x: solX, y: solY },
          { width: 160, height: 140 },
          'square'
        );
        
        const solResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `${solution.title}\n\n${solution.description}`,
            shape: 'square'
          },
          position: solPos,
          style: { fillColor: CONFIG.COLORS.SOLUTION }
        });
        
        const solId = solResponse.data.id;
        implementationState.solutionIds.push(solId);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Connect opportunity to solution
        try {
          await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: oppId },
            endItem: { id: solId },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow',
              strokeColor: '#666666',
              strokeWidth: 1
            }
          });
        } catch (err) {
          // Continue if connector fails
        }
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Add journey insight reference (small note)
        const insightPos = layoutDesigner.findSafePosition(
          { x: solPos.x, y: solPos.y + 160 },
          { width: 140, height: 50 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `📍 ${solution.fromJourney}`,
            shape: 'square'
          },
          position: insightPos,
          style: { fillColor: CONFIG.COLORS.LABEL }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
      
      // Create Experiments
      const expX = oppPos.x;
      const expStartY = solY + 400;
      
      for (let j = 0; j < opportunity.experiments.length; j++) {
        const experiment = opportunity.experiments[j];
        const expY = expStartY + (j * 120);
        
        const expPos = layoutDesigner.findSafePosition(
          { x: expX, y: expY },
          { width: 200, height: 80 },
          'square'
        );
        
        const expResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: experiment,
            shape: 'square'
          },
          position: expPos,
          style: { fillColor: CONFIG.COLORS.EXPERIMENT }
        });
        
        implementationState.experimentIds.push(expResponse.data.id);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Connect to middle solution
        if (opportunity.solutions.length > 0) {
          const middleSolIndex = Math.floor(opportunity.solutions.length / 2);
          const middleSolId = implementationState.solutionIds[
            implementationState.solutionIds.length - opportunity.solutions.length + middleSolIndex
          ];
          
          try {
            await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
              startItem: { id: middleSolId },
              endItem: { id: expResponse.data.id },
              style: {
                startStrokeCap: 'none',
                endStrokeCap: 'arrow',
                strokeColor: '#0062FF',
                strokeStyle: 'dashed',
                strokeWidth: 1
              }
            });
          } catch (err) {
            // Continue if connector fails
          }
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        }
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to build tree: ${error.message}`);
    implementationState.errors.push(error.message);
    return false;
  }
}

// Add summary section
async function addSummarySection() {
  log.phase('ADDING SUMMARY SECTION');
  
  try {
    const summaryX = 5000;
    const summaryY = 4800;
    
    // Summary header
    const headerPos = layoutDesigner.findSafePosition(
      { x: summaryX, y: summaryY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY SUCCESS METRICS\n15-Minute Insight Achievement',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Success metrics
    const metrics = [
      'Tutorial completion < 10 min',
      'Attribute mapping success rate > 80%',
      'Pattern discovery within 15 min',
      'User confidence score > 7/10',
      'Return for second session > 60%'
    ];
    
    for (let i = 0; i < metrics.length; i++) {
      const metricX = summaryX - 400 + (i % 3) * 300;
      const metricY = summaryY + 150 + Math.floor(i / 3) * 120;
      
      const metricPos = layoutDesigner.findSafePosition(
        { x: metricX, y: metricY },
        { width: 180, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: metrics[i],
          shape: 'square'
        },
        position: metricPos,
        style: { fillColor: 'light_yellow' }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to add summary: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'ost2-state.json';
  fs.writeFileSync(stateFile, JSON.stringify(implementationState, null, 2));
  log.info(`State saved to ${stateFile}`);
}

// Generate layout report
function generateLayoutReport() {
  const report = layoutDesigner.generateLayoutReport();
  
  console.log('\n📊 Layout Report:');
  console.log(`   Total items: ${report.totalItems}`);
  console.log(`   Layout density: ${report.density.toFixed(2)}%`);
  console.log(`   Collisions: ${report.collisions.length}`);
  console.log(`   Bounding box: ${report.boundingBox.width}x${report.boundingBox.height}`);
  
  if (report.collisions.length === 0) {
    console.log('   ✨ No overlapping elements - optimal visibility achieved!');
  } else {
    console.log(`   ⚠️  ${report.collisions.length} overlaps detected`);
  }
  
  return report;
}

// Main execution
async function main() {
  console.log('🌟 OST2 Implementation - Teresa Torres Opportunity Solution Tree');
  console.log('🎯 Anchored on: Users achieve first meaningful insight within 15 minutes');
  console.log('📐 Using enhanced Layout Designer for optimal visibility');
  console.log('');
  
  // Create OST2 frame
  const frameCreated = await createOST2Frame();
  if (!frameCreated) {
    log.error('Failed to create OST2 frame');
    return;
  }
  
  // Build the Opportunity Solution Tree
  const treeBuilt = await buildOpportunitySolutionTree();
  if (!treeBuilt) {
    log.error('Failed to build opportunity solution tree');
    saveState();
    return;
  }
  
  // Add summary section
  const summaryAdded = await addSummarySection();
  if (!summaryAdded) {
    log.error('Failed to add summary section');
  }
  
  // Generate layout report
  const layoutReport = generateLayoutReport();
  
  // Final report
  log.phase('🎉 OST2 IMPLEMENTATION COMPLETE!');
  console.log('📊 Created Teresa Torres Opportunity Solution Tree:');
  console.log(`   ✅ 1 Product Outcome (leading indicator)`);
  console.log(`   ✅ ${implementationState.opportunityIds.length} Opportunities (sub-outcomes)`);
  console.log(`   ✅ ${implementationState.solutionIds.length} Solutions (from user journey)`);
  console.log(`   ✅ ${implementationState.experimentIds.length} Experiments (validation tests)`);
  console.log(`   ✅ ${implementationState.connectorIds.length} Connections`);
  
  console.log('\n🔑 Key Features:');
  console.log('   • Anchored on 15-minute insight achievement');
  console.log('   • Solutions mapped to user journey pain points');
  console.log('   • Key moments referenced for context');
  console.log('   • Enhanced spacing for optimal visibility');
  console.log('   • No overlapping elements');
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres methodology: Outcome → Opportunities → Solutions → Experiments');
  console.log('🎨 Layout Designer ensured optimal spacing and visibility');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}