#!/usr/bin/env node

// Fix Galaxy Testing Assumptions Layout
// Reorganize with clear columns and no overlapping

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 150,
  
  // Layout configuration - wider spacing
  COLUMN_WIDTH: 400,
  CARD_WIDTH: 320,
  CARD_HEIGHT: 140,
  HORIZONTAL_GAP: 450,  // Increased gap between columns
  VERTICAL_GAP: 180,     // Increased gap between rows
  SECTION_GAP: 300,      // Gap between major sections
  
  // Colors
  COLORS: {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'yellow',
    LOW: 'light_green',
    VALIDATED: 'green',
    EXPERIMENT: 'blue',
    METRIC: 'violet',
    HEADER: 'dark_blue',
    INSIGHT: 'light_blue'
  }
};

// Miro API setup
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🎯 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// Find and delete existing items in the frame
async function cleanupExistingItems() {
  log.phase('CLEANING UP EXISTING ITEMS');
  
  try {
    // Find the frame
    const frameResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = frameResponse.data.data;
    
    const targetFrame = frames.find(frame => 
      frame.data && frame.data.title === 'Galaxy Testing Assumptions'
    );
    
    if (!targetFrame) {
      log.error('Galaxy Testing Assumptions frame not found');
      return null;
    }
    
    log.success(`Found frame at (${targetFrame.position.x}, ${targetFrame.position.y})`);
    
    // Get all items on the board (generic endpoint)
    const itemsResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?limit=100`);
    const allItems = itemsResponse.data.data;
    
    // Filter for sticky notes
    const allStickies = allItems.filter(item => item.type === 'sticky_note');
    
    // Find stickies within the frame bounds
    const frameX = targetFrame.position.x;
    const frameY = targetFrame.position.y;
    const frameWidth = targetFrame.geometry.width;
    const frameHeight = targetFrame.geometry.height;
    
    const frameBounds = {
      left: frameX - frameWidth/2,
      right: frameX + frameWidth/2,
      top: frameY - frameHeight/2,
      bottom: frameY + frameHeight/2
    };
    
    const stickiesInFrame = allStickies.filter(sticky => {
      if (!sticky.position) return false;
      return sticky.position.x >= frameBounds.left - 500 &&
             sticky.position.x <= frameBounds.right + 500 &&
             sticky.position.y >= frameBounds.top - 500 &&
             sticky.position.y <= frameBounds.bottom + 500;
    });
    
    log.info(`Found ${stickiesInFrame.length} stickies in frame area`);
    
    // Delete all stickies in the frame
    let deletedCount = 0;
    for (const sticky of stickiesInFrame) {
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${sticky.id}`);
        deletedCount++;
        if (deletedCount % 10 === 0) {
          log.info(`Deleted ${deletedCount} items...`);
        }
        await sleep(100);
      } catch (err) {
        // Continue if delete fails
      }
    }
    
    log.success(`Deleted ${deletedCount} existing items`);
    return targetFrame;
    
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    return null;
  }
}

// Create organized layout
async function createOrganizedLayout(frame) {
  log.phase('CREATING ORGANIZED LAYOUT');
  
  const frameX = frame.position.x;
  const frameY = frame.position.y;
  
  // Starting positions - well within frame
  const startX = frameX - 1600;
  const startY = frameY - 1400;
  
  try {
    // 1. MAIN TITLE
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'GALAXY TESTING ASSUMPTIONS\nTeresa Torres Discovery Framework\nProduct Outcome 1: 15-minute insight',
        shape: 'rectangle'
      },
      position: { x: frameX, y: startY - 200 },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // 2. DESIRABILITY SECTION (Column 1)
    const desirabilityX = startX;
    let currentY = startY;
    
    // Section header
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'DESIRABILITY\n❓ Will users want this?',
        shape: 'rectangle'
      },
      position: { x: desirabilityX, y: currentY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    currentY += CONFIG.VERTICAL_GAP;
    
    // Desirability assumptions
    const desirabilityAssumptions = [
      { text: '📌 Users need insights < 15 min\n🎯 80% achieve in time', risk: 'CRITICAL' },
      { text: '📌 Visual hierarchy improves comprehension\n🎯 50% faster pattern recognition', risk: 'HIGH' },
      { text: '📌 Templates accelerate setup\n🎯 Setup < 5 minutes', risk: 'HIGH' },
      { text: '📌 Users prefer guided analysis\n🎯 60% choose guided', risk: 'MEDIUM' }
    ];
    
    for (const assumption of desirabilityAssumptions) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: assumption.text, shape: 'square' },
        position: { x: desirabilityX, y: currentY },
        style: { fillColor: CONFIG.COLORS[assumption.risk] }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 3. VIABILITY SECTION (Column 2)
    const viabilityX = startX + CONFIG.HORIZONTAL_GAP;
    currentY = startY;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'VIABILITY\n❓ Can we build a business?',
        shape: 'rectangle'
      },
      position: { x: viabilityX, y: currentY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    currentY += CONFIG.VERTICAL_GAP;
    
    const viabilityAssumptions = [
      { text: '📌 Users will pay for insights\n🎯 30% willing at target price', risk: 'CRITICAL' },
      { text: '📌 Quick wins drive conversion\n🎯 25% trial-to-paid', risk: 'HIGH' },
      { text: '📌 Market size supports growth\n🎯 $10M addressable', risk: 'MEDIUM' }
    ];
    
    for (const assumption of viabilityAssumptions) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: assumption.text, shape: 'square' },
        position: { x: viabilityX, y: currentY },
        style: { fillColor: CONFIG.COLORS[assumption.risk] }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 4. FEASIBILITY SECTION (Column 3)
    const feasibilityX = startX + (CONFIG.HORIZONTAL_GAP * 2);
    currentY = startY;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'FEASIBILITY\n❓ Can we build it?',
        shape: 'rectangle'
      },
      position: { x: feasibilityX, y: currentY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    currentY += CONFIG.VERTICAL_GAP;
    
    const feasibilityAssumptions = [
      { text: '📌 Real-time data processing\n🎯 Response < 2 seconds', risk: 'HIGH' },
      { text: '📌 Visual rendering at scale\n🎯 100k data points smooth', risk: 'HIGH' },
      { text: '📌 AI pattern detection\n🎯 85% accuracy', risk: 'MEDIUM' }
    ];
    
    for (const assumption of feasibilityAssumptions) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: assumption.text, shape: 'square' },
        position: { x: feasibilityX, y: currentY },
        style: { fillColor: CONFIG.COLORS[assumption.risk] }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 5. USABILITY SECTION (Column 4)
    const usabilityX = startX + (CONFIG.HORIZONTAL_GAP * 3);
    currentY = startY;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'USABILITY\n❓ Can users use it?',
        shape: 'rectangle'
      },
      position: { x: usabilityX, y: currentY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    currentY += CONFIG.VERTICAL_GAP;
    
    const usabilityAssumptions = [
      { text: '📌 Interface is intuitive\n🎯 80% complete first task', risk: 'CRITICAL' },
      { text: '📌 Progressive disclosure works\n🎯 Satisfaction > 7/10', risk: 'HIGH' },
      { text: '📌 Contextual help sufficient\n🎯 <5% need support', risk: 'MEDIUM' }
    ];
    
    for (const assumption of usabilityAssumptions) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: assumption.text, shape: 'square' },
        position: { x: usabilityX, y: currentY },
        style: { fillColor: CONFIG.COLORS[assumption.risk] }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 6. ETHICAL SECTION (Column 5)
    const ethicalX = startX + (CONFIG.HORIZONTAL_GAP * 4);
    currentY = startY;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'ETHICAL\n❓ Should we build it?',
        shape: 'rectangle'
      },
      position: { x: ethicalX, y: currentY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    currentY += CONFIG.VERTICAL_GAP;
    
    const ethicalAssumptions = [
      { text: '📌 Data privacy maintained\n🎯 Zero breaches', risk: 'CRITICAL' },
      { text: '📌 AI is unbiased\n🎯 No discrimination', risk: 'HIGH' },
      { text: '📌 User autonomy preserved\n🎯 Users control decisions', risk: 'MEDIUM' }
    ];
    
    for (const assumption of ethicalAssumptions) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: assumption.text, shape: 'square' },
        position: { x: ethicalX, y: currentY },
        style: { fillColor: CONFIG.COLORS[assumption.risk] }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 7. EXPERIMENT TIMELINE (Bottom section)
    const timelineY = startY + 1000;
    const timelineStartX = startX;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'EXPERIMENT TIMELINE',
        shape: 'rectangle'
      },
      position: { x: frameX, y: timelineY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const weeks = [
      { week: 'WEEK 1', experiments: 'User testing\nTime tracking\nTemplate comparison' },
      { week: 'WEEK 2', experiments: 'A/B visual tests\nPricing survey\nPerformance tests' },
      { week: 'WEEK 3', experiments: 'Trial conversion\nML accuracy\nSupport analysis' },
      { week: 'WEEK 4', experiments: 'Security audit\nBias testing\nMarket analysis' }
    ];
    
    for (let i = 0; i < weeks.length; i++) {
      const weekX = timelineStartX + (i * CONFIG.HORIZONTAL_GAP);
      const weekY = timelineY + 150;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${weeks[i].week}\n\n${weeks[i].experiments}`,
          shape: 'square'
        },
        position: { x: weekX, y: weekY },
        style: { fillColor: CONFIG.COLORS.EXPERIMENT }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 8. RISK MITIGATION (Right side)
    const riskX = startX + (CONFIG.HORIZONTAL_GAP * 5);
    const riskY = startY;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'RISK MITIGATION',
        shape: 'rectangle'
      },
      position: { x: riskX, y: riskY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const risks = [
      { level: 'CRITICAL', action: 'Test Week 1\nPivot if invalid' },
      { level: 'HIGH', action: 'Test Week 1-2\nIterate quickly' },
      { level: 'MEDIUM', action: 'Test Week 2-3\nAdjust features' },
      { level: 'LOW', action: 'Monitor beta\nFine-tune later' }
    ];
    
    currentY = riskY + CONFIG.VERTICAL_GAP;
    for (const risk of risks) {
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${risk.level}\n${risk.action}`,
          shape: 'square'
        },
        position: { x: riskX, y: currentY },
        style: { fillColor: CONFIG.COLORS[risk.level] || CONFIG.COLORS.MEDIUM }
      });
      currentY += CONFIG.VERTICAL_GAP;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 9. SUCCESS METRICS (Bottom right)
    const metricsY = timelineY + 400;
    const metricsStartX = startX;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'SUCCESS METRICS',
        shape: 'rectangle'
      },
      position: { x: frameX, y: metricsY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const metrics = [
      '📊 Time to Insight\n🎯 < 15 minutes',
      '📊 Setup Completion\n🎯 > 80%',
      '📊 Pattern Recognition\n🎯 < 10 minutes',
      '📊 User Satisfaction\n🎯 > 8/10',
      '📊 Trial Conversion\n🎯 > 25%'
    ];
    
    for (let i = 0; i < metrics.length; i++) {
      const metricX = metricsStartX + (i * CONFIG.HORIZONTAL_GAP);
      const metricY = metricsY + 150;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: metrics[i],
          shape: 'square'
        },
        position: { x: metricX, y: metricY },
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // 10. KEY INSIGHTS (Bottom)
    const insightsY = metricsY + 350;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY DISCOVERY INSIGHTS',
        shape: 'rectangle'
      },
      position: { x: frameX, y: insightsY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const insights = [
      { text: '🚨 Users must see value in <15 min', color: 'CRITICAL' },
      { text: '✅ Visual hierarchy 3x faster', color: 'VALIDATED' },
      { text: '🎯 Templates reduce setup 75%', color: 'VALIDATED' },
      { text: '⚡ Quick wins = 2.5x conversion', color: 'HIGH' },
      { text: '🔬 AI accuracy needs validation', color: 'MEDIUM' },
      { text: '📊 Performance at scale = risk', color: 'HIGH' },
      { text: '💡 Progressive disclosure works', color: 'LOW' },
      { text: '🏆 Real-time feedback differentiates', color: 'VALIDATED' }
    ];
    
    for (let i = 0; i < insights.length; i++) {
      const insightX = metricsStartX + (i % 4) * CONFIG.HORIZONTAL_GAP;
      const insightY = insightsY + 150 + Math.floor(i / 4) * CONFIG.VERTICAL_GAP;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: insights[i].text,
          shape: 'square'
        },
        position: { x: insightX, y: insightY },
        style: { fillColor: CONFIG.COLORS[insights[i].color] || CONFIG.COLORS.INSIGHT }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    log.success('Created organized layout with clear columns');
    return true;
    
  } catch (error) {
    log.error(`Layout creation failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Fixing Galaxy Testing Assumptions Layout');
  console.log('📐 Creating organized columns with no overlap');
  console.log('');
  
  // Step 1: Cleanup existing items
  const frame = await cleanupExistingItems();
  if (!frame) {
    log.error('Cannot proceed without finding frame');
    return;
  }
  
  // Step 2: Create organized layout
  const layoutCreated = await createOrganizedLayout(frame);
  if (!layoutCreated) {
    log.error('Failed to create organized layout');
    return;
  }
  
  log.phase('✅ LAYOUT FIX COMPLETE');
  console.log('📊 Created organized assumption testing framework:');
  console.log('   • 5 clear columns for assumption categories');
  console.log('   • No overlapping elements');
  console.log('   • Proper spacing between all items');
  console.log('   • Timeline and metrics sections below');
  console.log('   • Risk mitigation on the right');
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('✨ Layout optimized for readability and clarity');
}

if (require.main === module) {
  main().catch(console.error);
}