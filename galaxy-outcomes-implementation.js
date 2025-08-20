#!/usr/bin/env node

// Galaxy Outcomes - Teresa Torres Product Outcomes Implementation
// Implements hierarchical product outcomes and traction metrics

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200,
  
  // Teresa Torres Outcome Colors
  COLORS: {
    BUSINESS_OUTCOME: 'dark_blue',     // Top level business outcomes
    PRODUCT_OUTCOME: 'blue',           // Product-level outcomes
    LEADING_INDICATOR: 'light_blue',   // Leading indicators
    TRACTION_METRIC: 'violet',         // Traction metrics
    LABEL: 'gray'                      // Section labels
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

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🎯 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// Teresa Torres Product Outcomes Hierarchy
const OUTCOMES_HIERARCHY = {
  business: {
    title: 'BUSINESS OUTCOME',
    content: 'Increase Monthly Recurring Revenue by 30%',
    children: [
      {
        title: 'PRODUCT OUTCOME 1',
        content: 'Increase user activation rate from 40% to 60%',
        children: [
          'New users complete onboarding within 7 days',
          'Users discover 3+ core features in first session',
          'Users invite team members within 14 days'
        ]
      },
      {
        title: 'PRODUCT OUTCOME 2', 
        content: 'Improve user retention from 70% to 85%',
        children: [
          'Users engage with product 3+ times per week',
          'Users create 5+ meaningful artifacts per month',
          'Users achieve first success milestone within 30 days'
        ]
      },
      {
        title: 'PRODUCT OUTCOME 3',
        content: 'Expand account value by 25% through upsells',
        children: [
          'Users upgrade from free to paid within 60 days',
          'Paid users adopt premium features within 90 days',
          'Teams expand from single to multi-user accounts'
        ]
      }
    ]
  }
};

// Traction Metrics (separate from outcomes)
const TRACTION_METRICS = [
  { category: 'Acquisition', metrics: ['New sign-ups per week', 'Cost per acquisition', 'Conversion rate from trial'] },
  { category: 'Activation', metrics: ['Time to first value', 'Onboarding completion rate', 'Feature adoption rate'] },
  { category: 'Retention', metrics: ['Monthly active users', 'Churn rate', 'Net promoter score'] },
  { category: 'Revenue', metrics: ['Average revenue per user', 'Customer lifetime value', 'Monthly recurring revenue growth'] },
  { category: 'Referral', metrics: ['Viral coefficient', 'Referral conversion rate', 'User-generated invites per month'] }
];

// Implementation state
let implementationState = {
  frameId: null,
  framePosition: null,
  businessOutcomeId: null,
  productOutcomeIds: [],
  leadingIndicatorIds: [],
  tractionMetricIds: [],
  connectorIds: [],
  errors: []
};

// Find the Galaxy Outcomes frame
async function findGalaxyOutcomesFrame() {
  log.phase('FINDING GALAXY OUTCOMES FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    const galaxyFrame = frames.find(frame => 
      frame.data && frame.data.title && 
      frame.data.title.toLowerCase().includes('galaxy outcomes')
    );
    
    if (galaxyFrame) {
      implementationState.frameId = galaxyFrame.id;
      implementationState.framePosition = galaxyFrame.position;
      log.success(`Found Galaxy Outcomes frame at position (${galaxyFrame.position.x}, ${galaxyFrame.position.y})`);
      return true;
    } else {
      log.error('Galaxy Outcomes frame not found');
      return false;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return false;
  }
}

// Create product outcomes hierarchy
async function createOutcomesHierarchy() {
  log.phase('CREATING PRODUCT OUTCOMES HIERARCHY');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    
    // Create Business Outcome (top of hierarchy)
    log.info('Creating business outcome...');
    const businessOutcome = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: `${OUTCOMES_HIERARCHY.business.title}\n\n${OUTCOMES_HIERARCHY.business.content}`,
        shape: 'square'
      },
      position: { x: frameX, y: frameY - 200 },
      style: { fillColor: CONFIG.COLORS.BUSINESS_OUTCOME }
    });
    
    implementationState.businessOutcomeId = businessOutcome.data.id;
    log.success(`Created business outcome: ${businessOutcome.data.id}`);
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create Product Outcomes (second level)
    log.info('Creating product outcomes...');
    for (let i = 0; i < OUTCOMES_HIERARCHY.business.children.length; i++) {
      const productOutcome = OUTCOMES_HIERARCHY.business.children[i];
      const xPos = frameX - 400 + (i * 400);
      const yPos = frameY + 100;
      
      const response = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${productOutcome.title}\n\n${productOutcome.content}`,
          shape: 'square'
        },
        position: { x: xPos, y: yPos },
        style: { fillColor: CONFIG.COLORS.PRODUCT_OUTCOME }
      });
      
      const productOutcomeId = response.data.id;
      implementationState.productOutcomeIds.push(productOutcomeId);
      log.success(`Created product outcome ${i + 1}`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create connector from business to product outcome
      try {
        const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
          startItem: { id: implementationState.businessOutcomeId },
          endItem: { id: productOutcomeId },
          style: { startStrokeCap: 'none', endStrokeCap: 'arrow', strokeColor: '#1a1a1a' }
        });
        implementationState.connectorIds.push(connector.data.id);
      } catch (err) {
        log.error(`Failed to create connector: ${err.message}`);
      }
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create Leading Indicators (third level)
      for (let j = 0; j < productOutcome.children.length; j++) {
        const indicator = productOutcome.children[j];
        const indicatorX = xPos - 100 + (j * 100);
        const indicatorY = yPos + 250;
        
        const indicatorResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: indicator,
            shape: 'square'
          },
          position: { x: indicatorX, y: indicatorY },
          style: { fillColor: CONFIG.COLORS.LEADING_INDICATOR }
        });
        
        const indicatorId = indicatorResponse.data.id;
        implementationState.leadingIndicatorIds.push(indicatorId);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Create connector from product outcome to indicator
        try {
          const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: productOutcomeId },
            endItem: { id: indicatorId },
            style: { startStrokeCap: 'none', endStrokeCap: 'arrow', strokeColor: '#1a1a1a' }
          });
          implementationState.connectorIds.push(connector.data.id);
        } catch (err) {
          // Continue even if connector fails
        }
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create outcomes hierarchy: ${error.message}`);
    implementationState.errors.push(`Outcomes: ${error.message}`);
    return false;
  }
}

// Create traction metrics section
async function createTractionMetrics() {
  log.phase('CREATING TRACTION METRICS');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startY = frameY + 600;
    
    // Create section header
    log.info('Creating traction metrics header...');
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'TRACTION METRICS\n(AARRR Framework)',
        shape: 'rectangle'
      },
      position: { x: frameX, y: startY },
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create metric categories
    log.info('Creating metric categories...');
    for (let i = 0; i < TRACTION_METRICS.length; i++) {
      const category = TRACTION_METRICS[i];
      const categoryX = frameX - 400 + (i * 200);
      const categoryY = startY + 100;
      
      // Category header
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: category.category,
          shape: 'square'
        },
        position: { x: categoryX, y: categoryY },
        style: { fillColor: CONFIG.COLORS.LABEL }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Individual metrics
      for (let j = 0; j < category.metrics.length; j++) {
        const metric = category.metrics[j];
        const metricY = categoryY + 120 + (j * 100);
        
        const metricResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: metric,
            shape: 'square'
          },
          position: { x: categoryX, y: metricY },
          style: { fillColor: CONFIG.COLORS.TRACTION_METRIC }
        });
        
        implementationState.tractionMetricIds.push(metricResponse.data.id);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    log.success(`Created ${implementationState.tractionMetricIds.length} traction metrics`);
    return true;
  } catch (error) {
    log.error(`Failed to create traction metrics: ${error.message}`);
    implementationState.errors.push(`Metrics: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'galaxy-outcomes-state.json';
  fs.writeFileSync(stateFile, JSON.stringify(implementationState, null, 2));
  log.info(`State saved to ${stateFile}`);
}

// Main execution
async function main() {
  console.log('🌌 Galaxy Outcomes - Teresa Torres Product Outcomes Implementation');
  console.log('📊 Building hierarchical outcomes and traction metrics');
  console.log('');
  
  // Find the Galaxy Outcomes frame
  const frameFound = await findGalaxyOutcomesFrame();
  if (!frameFound) {
    log.error('Cannot proceed without Galaxy Outcomes frame');
    console.log('\nPlease ensure you have a frame titled "Galaxy Outcomes" on your board');
    return;
  }
  
  // Create outcomes hierarchy
  const outcomesCreated = await createOutcomesHierarchy();
  if (!outcomesCreated) {
    log.error('Failed to create outcomes hierarchy');
    saveState();
    return;
  }
  
  // Create traction metrics
  const metricsCreated = await createTractionMetrics();
  if (!metricsCreated) {
    log.error('Failed to create traction metrics');
    saveState();
    return;
  }
  
  // Final report
  log.phase('🎉 IMPLEMENTATION COMPLETE!');
  console.log('📊 Galaxy Outcomes created with:');
  console.log(`   ✅ 1 Business Outcome (dark blue)`);
  console.log(`   ✅ ${implementationState.productOutcomeIds.length} Product Outcomes (blue)`);
  console.log(`   ✅ ${implementationState.leadingIndicatorIds.length} Leading Indicators (light blue)`);
  console.log(`   ✅ ${implementationState.tractionMetricIds.length} Traction Metrics (violet)`);
  console.log(`   ✅ ${implementationState.connectorIds.length} Parent-child connections`);
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres methodology: Product outcomes cascade from business outcomes');
  console.log('📈 AARRR metrics track: Acquisition → Activation → Retention → Revenue → Referral');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}