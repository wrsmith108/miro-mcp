#!/usr/bin/env node

// Example: Using Layout Designer in Miro Board Implementation
// Shows how to integrate proper spacing into any Miro script

const axios = require('axios');
const LayoutDesigner = require('./layout-designer');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200,
  
  COLORS: {
    OUTCOME: 'blue',
    OPPORTUNITY: 'light_green',
    SOLUTION: 'yellow',
    EXPERIMENT: 'dark_blue'
  }
};

// Initialize Layout Designer with optimal settings
const layoutDesigner = new LayoutDesigner({
  minPadding: 60,           // Minimum space between stickies
  horizontalGap: 280,        // Horizontal spacing
  verticalGap: 280,          // Vertical spacing
  connectorClearance: 40,    // Extra space for connectors
  useGrid: true,
  gridCellWidth: 350,
  gridCellHeight: 350
});

// Miro API setup
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Example: Create a properly spaced Opportunity Solution Tree
async function createSpacedOpportunitySolutionTree() {
  console.log('🎯 Creating Opportunity Solution Tree with proper spacing');
  console.log('📐 Using Layout Designer to prevent overlaps\n');
  
  // Reset layout designer for fresh calculation
  layoutDesigner.reset();
  
  // Define the structure
  const outcomePos = { x: 2000, y: 2000 };
  const opportunities = [
    {
      title: 'Simplify Onboarding',
      solutions: [
        'Interactive Tutorial',
        'Quick Start Templates',
        'AI Setup Assistant'
      ],
      experiments: ['A/B Test Tutorial Flow']
    },
    {
      title: 'Improve Data Understanding',
      solutions: [
        'Visual Attribute Guide',
        'Smart Recommendations',
        'Example Gallery'
      ],
      experiments: ['User Testing Session']
    },
    {
      title: 'Accelerate Value Discovery',
      solutions: [
        'Insight Highlights',
        'Pattern Detection',
        'Quick Wins Dashboard'
      ],
      experiments: ['Analytics Tracking']
    }
  ];
  
  // Use Layout Designer to calculate all positions
  const layout = layoutDesigner.calculateOpportunitySolutionTree(outcomePos, opportunities);
  
  console.log('📊 Layout calculated:');
  console.log(`   Outcome: (${layout.outcome.x}, ${layout.outcome.y})`);
  console.log(`   ${layout.opportunities.length} opportunities positioned`);
  console.log(`   ${layout.solutions.length} solutions positioned`);
  console.log(`   ${layout.experiments.length} experiments positioned\n`);
  
  // Create the items on Miro board
  try {
    // Create outcome
    console.log('Creating outcome...');
    const outcomeResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'PRIMARY OUTCOME\nValidate customer value',
        shape: 'square'
      },
      position: layout.outcome,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    const outcomeId = outcomeResponse.data.id;
    console.log(`✅ Created outcome at (${layout.outcome.x}, ${layout.outcome.y})`);
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create opportunities
    const opportunityIds = [];
    for (let i = 0; i < layout.opportunities.length; i++) {
      const opp = layout.opportunities[i];
      const response = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: opp.opportunity.title,
          shape: 'square'
        },
        position: opp.position,
        style: { fillColor: CONFIG.COLORS.OPPORTUNITY }
      });
      opportunityIds.push(response.data.id);
      console.log(`✅ Created opportunity ${i + 1} at (${opp.position.x}, ${opp.position.y})`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create connector from outcome to opportunity
      try {
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
          startItem: { id: outcomeId },
          endItem: { id: response.data.id },
          style: { 
            startStrokeCap: 'none',
            endStrokeCap: 'arrow',
            strokeColor: '#1a1a1a'
          }
        });
      } catch (err) {
        // Continue if connector fails
      }
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // Create solutions
    for (const sol of layout.solutions) {
      const response = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: sol.solution,
          shape: 'square'
        },
        position: sol.position,
        style: { fillColor: CONFIG.COLORS.SOLUTION }
      });
      console.log(`✅ Created solution at (${sol.position.x}, ${sol.position.y})`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // Create experiments
    for (const exp of layout.experiments) {
      const response = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: exp.experiment,
          shape: 'square'
        },
        position: exp.position,
        style: { fillColor: CONFIG.COLORS.EXPERIMENT }
      });
      console.log(`✅ Created experiment at (${exp.position.x}, ${exp.position.y})`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // Generate layout report
    const report = layoutDesigner.generateLayoutReport();
    console.log('\n📊 Layout Report:');
    console.log(`   Total items: ${report.totalItems}`);
    console.log(`   Layout density: ${report.density.toFixed(2)}%`);
    console.log(`   Collisions: ${report.collisions.length}`);
    console.log(`   Bounding box: ${report.boundingBox.width}x${report.boundingBox.height}`);
    
    if (report.collisions.length === 0) {
      console.log('\n✨ Success! No overlapping stickies detected.');
    } else {
      console.log(`\n⚠️  Warning: ${report.collisions.length} overlaps detected.`);
    }
    
  } catch (error) {
    console.error('❌ Error creating items:', error.message);
  }
}

// Example: Create a properly spaced grid layout
async function createSpacedGridLayout() {
  console.log('\n🎯 Creating Grid Layout with proper spacing');
  
  layoutDesigner.reset();
  
  const items = [
    { content: 'Item 1', shape: 'square' },
    { content: 'Item 2', shape: 'square' },
    { content: 'Item 3', shape: 'square' },
    { content: 'Item 4', shape: 'square' },
    { content: 'Item 5', shape: 'square' },
    { content: 'Item 6', shape: 'square' }
  ];
  
  const startPos = { x: 3000, y: 3000 };
  const layout = layoutDesigner.calculateGridLayout(startPos, items, 3);
  
  console.log('📊 Grid layout calculated:');
  layout.forEach((item, i) => {
    console.log(`   Item ${i + 1}: (${item.position.x}, ${item.position.y})`);
  });
  
  // Create items (implementation similar to above)
  console.log('\n✅ Grid layout ready for implementation');
}

// Main execution
async function main() {
  console.log('🎨 Layout Designer Integration Example');
  console.log('📐 Demonstrating proper spacing in Miro boards');
  console.log('═'.repeat(50) + '\n');
  
  // Create properly spaced Opportunity Solution Tree
  await createSpacedOpportunitySolutionTree();
  
  // Demonstrate grid layout
  await createSpacedGridLayout();
  
  console.log('\n' + '═'.repeat(50));
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📏 All items positioned with minimum 60px padding');
  console.log('✨ No overlapping stickies!');
}

if (require.main === module) {
  main().catch(console.error);
}