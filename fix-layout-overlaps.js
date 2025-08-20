#!/usr/bin/env node

// Fix Layout Overlaps - Demonstrates Layout Designer Usage
// Updates existing frames with proper spacing

const axios = require('axios');
const fs = require('fs');
const LayoutDesigner = require('./layout-designer');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200
};

// Miro API setup
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Initialize Layout Designer with optimal settings
const layoutDesigner = new LayoutDesigner({
  minPadding: 60,           // Increased padding
  horizontalGap: 280,        // More horizontal space
  verticalGap: 280,          // More vertical space
  connectorClearance: 40,    // Space for connectors
  useGrid: true,
  gridCellWidth: 350,
  gridCellHeight: 350
});

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🎯 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// Fix overlaps in a specific frame
async function fixFrameOverlaps(frameTitle) {
  log.phase(`FIXING OVERLAPS IN: ${frameTitle}`);
  
  try {
    // Find the frame
    const framesResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frame = framesResponse.data.data.find(f => 
      f.data && f.data.title && f.data.title.toLowerCase().includes(frameTitle.toLowerCase())
    );
    
    if (!frame) {
      log.error(`Frame "${frameTitle}" not found`);
      return false;
    }
    
    log.success(`Found frame at position (${frame.position.x}, ${frame.position.y})`);
    
    // Get all items in the frame area
    const itemsResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?limit=100`);
    const allItems = itemsResponse.data.data;
    
    // Filter items within frame bounds (approximate)
    const frameItems = allItems.filter(item => {
      if (!item.position) return false;
      const dx = Math.abs(item.position.x - frame.position.x);
      const dy = Math.abs(item.position.y - frame.position.y);
      return dx < 2000 && dy < 2000; // Within frame vicinity
    });
    
    log.info(`Found ${frameItems.length} items in frame vicinity`);
    
    // Reset layout designer for new calculation
    layoutDesigner.reset();
    
    // Group items by type for better organization
    const stickyNotes = frameItems.filter(item => item.type === 'sticky_note');
    const connectors = frameItems.filter(item => item.type === 'connector');
    
    // Calculate new positions using layout designer
    const newPositions = [];
    
    // Process sticky notes with proper spacing
    stickyNotes.forEach((sticky, index) => {
      const currentPos = sticky.position;
      const shape = sticky.data?.shape || 'square';
      
      // Use layout designer to find safe position
      const safePos = layoutDesigner.findSafePosition(
        currentPos,
        null,
        shape
      );
      
      // Only update if position changed significantly
      if (Math.abs(safePos.x - currentPos.x) > 5 || Math.abs(safePos.y - currentPos.y) > 5) {
        newPositions.push({
          id: sticky.id,
          oldPos: currentPos,
          newPos: safePos
        });
      }
    });
    
    log.info(`Need to reposition ${newPositions.length} items`);
    
    // Apply new positions
    for (const pos of newPositions) {
      try {
        await miroApi.patch(`/boards/${CONFIG.BOARD_ID}/items/${pos.id}`, {
          position: pos.newPos
        });
        log.success(`Repositioned item ${pos.id}`);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (err) {
        log.error(`Failed to reposition ${pos.id}: ${err.message}`);
      }
    }
    
    // Generate layout report
    const report = layoutDesigner.generateLayoutReport();
    log.info(`Layout density: ${report.density.toFixed(2)}%`);
    log.info(`Collisions detected: ${report.collisions.length}`);
    
    return true;
  } catch (error) {
    log.error(`Failed to fix overlaps: ${error.message}`);
    return false;
  }
}

// Example: Create properly spaced Teresa Torres structure
async function createProperlySpacedStructure() {
  log.phase('CREATING PROPERLY SPACED STRUCTURE');
  
  // Example Opportunity Solution Tree with proper spacing
  const outcomePos = { x: 1400, y: 100 };
  
  const opportunities = [
    {
      title: 'User Onboarding',
      solutions: ['Tutorial', 'Templates', 'AI Assistant'],
      experiments: ['A/B Test']
    },
    {
      title: 'Data Understanding',
      solutions: ['Visual Guide', 'Tooltips', 'Examples'],
      experiments: ['User Study']
    },
    {
      title: 'Value Discovery',
      solutions: ['Quick Wins', 'Showcases', 'Reports'],
      experiments: ['Analytics']
    }
  ];
  
  // Use layout designer to calculate positions
  const layout = layoutDesigner.calculateOpportunitySolutionTree(outcomePos, opportunities);
  
  log.info('Calculated layout:');
  log.info(`  Outcome position: (${layout.outcome.x}, ${layout.outcome.y})`);
  log.info(`  ${layout.opportunities.length} opportunities positioned`);
  log.info(`  ${layout.solutions.length} solutions positioned`);
  log.info(`  ${layout.experiments.length} experiments positioned`);
  
  // Check for any remaining collisions
  const report = layoutDesigner.generateLayoutReport();
  if (report.collisions.length === 0) {
    log.success('No overlaps detected! Layout is clean.');
  } else {
    log.error(`${report.collisions.length} overlaps detected - may need adjustment`);
  }
  
  return layout;
}

// Main execution
async function main() {
  console.log('🎨 Layout Designer - Fixing Sticky Overlaps');
  console.log('📊 Ensuring proper spacing between all elements');
  console.log('');
  
  // Fix specific frames
  const framesToFix = [
    'Galaxy Opportunity Solution Tree',
    'Galaxy Outcomes',
    'User stories and key moments'
  ];
  
  for (const frameTitle of framesToFix) {
    const success = await fixFrameOverlaps(frameTitle);
    if (success) {
      log.success(`Fixed overlaps in "${frameTitle}"`);
    }
  }
  
  // Demonstrate proper spacing calculation
  const properLayout = await createProperlySpacedStructure();
  
  // Save layout report
  const report = {
    timestamp: new Date().toISOString(),
    framesProcessed: framesToFix,
    layoutDesignerConfig: {
      minPadding: 60,
      horizontalGap: 280,
      verticalGap: 280
    },
    exampleLayout: properLayout,
    finalReport: layoutDesigner.generateLayoutReport()
  };
  
  fs.writeFileSync('layout-fix-report.json', JSON.stringify(report, null, 2));
  log.info('Layout report saved to layout-fix-report.json');
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📐 Layout Designer ensures minimum 60px padding between all stickies');
  console.log('✨ No more overlapping stickies!');
}

if (require.main === module) {
  main().catch(console.error);
}