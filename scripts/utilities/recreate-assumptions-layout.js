#!/usr/bin/env node

// Recreate Galaxy Testing Assumptions with Fixed Layout
// Clear columns, no overlapping

const axios = require('axios');
require('dotenv').config();

// Configuration with much wider spacing
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 150,
  
  // Extra wide spacing to prevent overlap
  COLUMN_WIDTH: 500,
  CARD_WIDTH: 350,
  CARD_HEIGHT: 150,
  HORIZONTAL_GAP: 550,  // Very wide column spacing
  VERTICAL_GAP: 200,     // Generous vertical spacing
  SECTION_GAP: 400,      // Large gap between sections
  
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

// Known frame position from previous runs
const FRAME_POSITION = {
  x: 21255.677403183334,
  y: 7064.791154725034
};

// Create the organized layout
async function createFixedLayout() {
  log.phase('CREATING FIXED LAYOUT IN GALAXY TESTING ASSUMPTIONS');
  
  const frameX = FRAME_POSITION.x;
  const frameY = FRAME_POSITION.y;
  
  // Calculate starting positions - offset from previous attempt to avoid overlap
  const offsetX = 2500; // Move everything to the right to avoid existing items
  const startX = frameX - 1600 + offsetX;
  const startY = frameY - 1400;
  
  let itemCount = 0;
  
  try {
    // 1. MAIN TITLE (centered)
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: '🔬 GALAXY TESTING ASSUMPTIONS - FIXED LAYOUT\nTeresa Torres Discovery Framework\nProduct Outcome 1: 15-minute insight',
        shape: 'rectangle'
      },
      position: { x: frameX + offsetX, y: startY - 250 },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    itemCount++;
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create 5 vertical columns for categories
    const categories = [
      {
        title: 'DESIRABILITY',
        subtitle: 'Will users want this?',
        assumptions: [
          { text: '📌 15-min insights\n🎯 80% achieve', risk: 'CRITICAL' },
          { text: '📌 Visual > tables\n🎯 50% faster', risk: 'HIGH' },
          { text: '📌 Templates work\n🎯 <5 min setup', risk: 'HIGH' },
          { text: '📌 Guided preferred\n🎯 60% choose', risk: 'MEDIUM' }
        ]
      },
      {
        title: 'VIABILITY',
        subtitle: 'Can we sustain it?',
        assumptions: [
          { text: '📌 Will pay\n🎯 30% at price', risk: 'CRITICAL' },
          { text: '📌 Quick converts\n🎯 25% trial-paid', risk: 'HIGH' },
          { text: '📌 Market size\n🎯 $10M TAM', risk: 'MEDIUM' }
        ]
      },
      {
        title: 'FEASIBILITY',
        subtitle: 'Can we build it?',
        assumptions: [
          { text: '📌 Real-time\n🎯 <2 sec response', risk: 'HIGH' },
          { text: '📌 Scale visuals\n🎯 100k points', risk: 'HIGH' },
          { text: '📌 AI accuracy\n🎯 85% correct', risk: 'MEDIUM' }
        ]
      },
      {
        title: 'USABILITY',
        subtitle: 'Can users use it?',
        assumptions: [
          { text: '📌 Intuitive UI\n🎯 80% succeed', risk: 'CRITICAL' },
          { text: '📌 No overwhelm\n🎯 7/10 satisfaction', risk: 'HIGH' },
          { text: '📌 Self-service\n🎯 <5% support', risk: 'MEDIUM' }
        ]
      },
      {
        title: 'ETHICAL',
        subtitle: 'Should we build?',
        assumptions: [
          { text: '📌 Privacy safe\n🎯 Zero breach', risk: 'CRITICAL' },
          { text: '📌 No bias\n🎯 Fair to all', risk: 'HIGH' },
          { text: '📌 User control\n🎯 Full autonomy', risk: 'MEDIUM' }
        ]
      }
    ];
    
    // Create each category column
    for (let colIndex = 0; colIndex < categories.length; colIndex++) {
      const category = categories[colIndex];
      const colX = startX + (colIndex * CONFIG.HORIZONTAL_GAP);
      let colY = startY;
      
      // Category header
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${category.title}\n❓ ${category.subtitle}`,
          shape: 'rectangle'
        },
        position: { x: colX, y: colY },
        style: { fillColor: CONFIG.COLORS.HEADER }
      });
      itemCount++;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      colY += CONFIG.VERTICAL_GAP;
      
      // Assumptions in this category
      for (const assumption of category.assumptions) {
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: { content: assumption.text, shape: 'square' },
          position: { x: colX, y: colY },
          style: { fillColor: CONFIG.COLORS[assumption.risk] }
        });
        itemCount++;
        colY += CONFIG.VERTICAL_GAP;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    // EXPERIMENT TIMELINE (below categories)
    const timelineY = startY + 1100;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: { content: '📅 EXPERIMENT TIMELINE', shape: 'rectangle' },
      position: { x: frameX + offsetX, y: timelineY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    itemCount++;
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const weeks = [
      { title: 'WEEK 1', tasks: 'User testing\nTime tracking\nTemplates' },
      { title: 'WEEK 2', tasks: 'A/B tests\nPricing\nPerformance' },
      { title: 'WEEK 3', tasks: 'Conversion\nML testing\nSupport' },
      { title: 'WEEK 4', tasks: 'Security\nBias check\nMarket size' }
    ];
    
    for (let i = 0; i < weeks.length; i++) {
      const weekX = startX + (i * CONFIG.HORIZONTAL_GAP * 1.25);
      const weekY = timelineY + 180;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: `${weeks[i].title}\n\n${weeks[i].tasks}`, shape: 'square' },
        position: { x: weekX, y: weekY },
        style: { fillColor: CONFIG.COLORS.EXPERIMENT }
      });
      itemCount++;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // SUCCESS METRICS (below timeline)
    const metricsY = timelineY + 450;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: { content: '📊 SUCCESS METRICS', shape: 'rectangle' },
      position: { x: frameX + offsetX, y: metricsY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    itemCount++;
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const metrics = [
      '⏱️ Time to Insight\n< 15 minutes',
      '✅ Setup Rate\n> 80% complete',
      '👁️ Pattern Time\n< 10 minutes',
      '😊 Satisfaction\n> 8/10 NPS',
      '💰 Conversion\n> 25% trial'
    ];
    
    for (let i = 0; i < metrics.length; i++) {
      const metricX = startX + (i * CONFIG.HORIZONTAL_GAP);
      const metricY = metricsY + 180;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: metrics[i], shape: 'square' },
        position: { x: metricX, y: metricY },
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      itemCount++;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // KEY INSIGHTS (bottom)
    const insightsY = metricsY + 400;
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: { content: '💡 KEY INSIGHTS', shape: 'rectangle' },
      position: { x: frameX + offsetX, y: insightsY },
      style: { fillColor: CONFIG.COLORS.HEADER }
    });
    itemCount++;
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    const insights = [
      { text: '🚨 15 min critical', color: 'CRITICAL' },
      { text: '✅ Visual 3x faster', color: 'VALIDATED' },
      { text: '🎯 Templates 75% faster', color: 'VALIDATED' },
      { text: '⚡ Quick = 2.5x convert', color: 'HIGH' }
    ];
    
    for (let i = 0; i < insights.length; i++) {
      const insightX = startX + (i * CONFIG.HORIZONTAL_GAP * 1.25);
      const insightY = insightsY + 180;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { content: insights[i].text, shape: 'square' },
        position: { x: insightX, y: insightY },
        style: { fillColor: CONFIG.COLORS[insights[i].color] }
      });
      itemCount++;
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    log.success(`Created ${itemCount} items in organized layout`);
    return true;
    
  } catch (error) {
    log.error(`Failed to create layout: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Recreating Galaxy Testing Assumptions with Fixed Layout');
  console.log('📐 Wide spacing, clear columns, no overlap');
  console.log(`📍 Frame position: (${FRAME_POSITION.x}, ${FRAME_POSITION.y})`);
  console.log('');
  
  const success = await createFixedLayout();
  
  if (success) {
    log.phase('✅ LAYOUT RECREATION COMPLETE');
    console.log('📊 Created organized framework with:');
    console.log('   • 5 clear vertical columns');
    console.log('   • Wide spacing (550px between columns)');
    console.log('   • Generous vertical gaps (200px)');
    console.log('   • Timeline section below categories');
    console.log('   • Metrics dashboard at bottom');
    console.log('   • Offset positioning to avoid existing items');
    console.log('');
    console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
    console.log('✨ No overlapping elements - optimal readability');
    console.log('');
    console.log('💡 TIP: If old items still exist, manually select and delete them');
    console.log('   or use the frame\'s context menu to clear contents');
  } else {
    log.error('Layout recreation failed');
  }
}

if (require.main === module) {
  main().catch(console.error);
}