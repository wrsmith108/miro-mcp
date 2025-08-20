#!/usr/bin/env node

// Galaxy Outcomes Update - Teresa Torres Model for Proof of Concept
// Updates outcomes based on Universal Metaphor Product Discovery Report

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
    BUSINESS_OUTCOME: 'dark_blue',     // Lagging indicator
    PRODUCT_OUTCOME: 'blue',           // Leading indicators
    LEADING_INDICATOR: 'light_blue',   // Specific behaviors
    TRACTION_METRIC: 'violet',         // Operational metrics
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

// Load previous state
let previousState = {};
try {
  previousState = JSON.parse(fs.readFileSync('galaxy-outcomes-state.json', 'utf8'));
} catch (e) {
  log.error('No previous state found, creating from scratch');
}

// Updated Teresa Torres Product Outcomes Hierarchy
// Based on Universal Metaphor Product Discovery Report
const UPDATED_OUTCOMES = {
  business: {
    title: 'BUSINESS OUTCOME (Lagging)',
    content: 'Validate customer value with paid subscription',
    children: [
      {
        title: 'PRODUCT OUTCOME 1 (Leading)',
        content: 'Users achieve first meaningful insight within 15 minutes',
        children: [
          'Complete simplified tutorial in <10 minutes',
          'Successfully map 2-3 key attributes to their data',
          'Identify at least one actionable pattern'
        ]
      },
      {
        title: 'PRODUCT OUTCOME 2 (Leading)', 
        content: 'Users return for 3+ sessions within first week',
        children: [
          'Save and revisit a galaxy configuration',
          'Create a custom calculated field or metric',
          'Share an insight with team member or stakeholder'
        ]
      },
      {
        title: 'PRODUCT OUTCOME 3 (Leading)',
        content: 'Users express willingness to pay within 30 days',
        children: [
          'Request advanced features or more data capacity',
          'Complete value survey with NPS > 7',
          'Initiate pricing conversation or trial extension'
        ]
      }
    ]
  }
};

// Early-Stage Validation Metrics (for zero-customer product)
const VALIDATION_METRICS = [
  { 
    category: 'Discovery', 
    metrics: [
      'Time to first "aha" moment',
      'Tutorial completion rate',
      'Self-serve success rate'
    ]
  },
  { 
    category: 'Engagement', 
    metrics: [
      'Sessions per week',
      'Features explored',
      'Data sources connected'
    ]
  },
  { 
    category: 'Value Signals', 
    metrics: [
      'Insights discovered per session',
      'Custom metrics created',
      'Collaborative shares initiated'
    ]
  },
  { 
    category: 'Conversion Signals', 
    metrics: [
      'Free → Trial conversion',
      'Feature limit encounters',
      'Pricing page visits'
    ]
  },
  { 
    category: 'Quality', 
    metrics: [
      'Configuration accuracy',
      'Support tickets per user',
      'User-reported confusion score'
    ]
  }
];

// Implementation state
let implementationState = {
  frameId: previousState.frameId || null,
  framePosition: previousState.framePosition || null,
  itemsToDelete: [],
  businessOutcomeId: null,
  productOutcomeIds: [],
  leadingIndicatorIds: [],
  validationMetricIds: [],
  connectorIds: [],
  errors: []
};

// Delete existing items
async function deleteExistingItems() {
  log.phase('CLEANING UP EXISTING ITEMS');
  
  try {
    // Collect all items to delete from previous state
    const itemsToDelete = [
      previousState.businessOutcomeId,
      ...(previousState.productOutcomeIds || []),
      ...(previousState.leadingIndicatorIds || []),
      ...(previousState.tractionMetricIds || []),
      ...(previousState.connectorIds || [])
    ].filter(id => id);
    
    log.info(`Found ${itemsToDelete.length} items to delete`);
    
    for (let i = 0; i < itemsToDelete.length; i++) {
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${itemsToDelete[i]}`);
        await sleep(100); // Faster deletion
      } catch (err) {
        // Item might already be deleted
      }
      
      if (i % 10 === 0) {
        log.info(`Deleted ${i + 1}/${itemsToDelete.length} items...`);
      }
    }
    
    log.success('Cleanup complete');
    return true;
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    return false;
  }
}

// Create updated product outcomes hierarchy
async function createUpdatedOutcomes() {
  log.phase('CREATING UPDATED PRODUCT OUTCOMES');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    
    // Create Business Outcome (Lagging Indicator)
    log.info('Creating business outcome (lagging indicator)...');
    const businessOutcome = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: `${UPDATED_OUTCOMES.business.title}\n\n${UPDATED_OUTCOMES.business.content}`,
        shape: 'square'
      },
      position: { x: frameX, y: frameY - 200 },
      style: { fillColor: CONFIG.COLORS.BUSINESS_OUTCOME }
    });
    
    implementationState.businessOutcomeId = businessOutcome.data.id;
    log.success(`Created business outcome: ${businessOutcome.data.id}`);
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create Product Outcomes (Leading Indicators)
    log.info('Creating product outcomes (leading indicators)...');
    for (let i = 0; i < UPDATED_OUTCOMES.business.children.length; i++) {
      const productOutcome = UPDATED_OUTCOMES.business.children[i];
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
      log.success(`Created product outcome ${i + 1}: ${productOutcomeId}`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create connector from business to product outcome
      try {
        const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
          startItem: { id: implementationState.businessOutcomeId },
          endItem: { id: productOutcomeId },
          style: { 
            startStrokeCap: 'none', 
            endStrokeCap: 'arrow', 
            strokeColor: '#1a1a1a',
            strokeStyle: 'normal',
            strokeWidth: 2
          }
        });
        implementationState.connectorIds.push(connector.data.id);
      } catch (err) {
        log.error(`Failed to create connector: ${err.message}`);
      }
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create Supporting Behaviors (specific leading indicators)
      for (let j = 0; j < productOutcome.children.length; j++) {
        const behavior = productOutcome.children[j];
        const behaviorX = xPos - 100 + (j * 100);
        const behaviorY = yPos + 250;
        
        const behaviorResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: behavior,
            shape: 'square'
          },
          position: { x: behaviorX, y: behaviorY },
          style: { fillColor: CONFIG.COLORS.LEADING_INDICATOR }
        });
        
        const behaviorId = behaviorResponse.data.id;
        implementationState.leadingIndicatorIds.push(behaviorId);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Create connector from product outcome to behavior
        try {
          const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: productOutcomeId },
            endItem: { id: behaviorId },
            style: { 
              startStrokeCap: 'none', 
              endStrokeCap: 'arrow', 
              strokeColor: '#1a1a1a',
              strokeStyle: 'dashed',
              strokeWidth: 1
            }
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
    log.error(`Failed to create outcomes: ${error.message}`);
    implementationState.errors.push(`Outcomes: ${error.message}`);
    return false;
  }
}

// Create validation metrics for proof of concept
async function createValidationMetrics() {
  log.phase('CREATING VALIDATION METRICS');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startY = frameY + 600;
    
    // Create section header
    log.info('Creating validation metrics header...');
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'VALIDATION METRICS\n(Proof of Concept Stage)',
        shape: 'rectangle'
      },
      position: { x: frameX, y: startY },
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create metric categories
    log.info('Creating validation metric categories...');
    for (let i = 0; i < VALIDATION_METRICS.length; i++) {
      const category = VALIDATION_METRICS[i];
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
        
        implementationState.validationMetricIds.push(metricResponse.data.id);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    log.success(`Created ${implementationState.validationMetricIds.length} validation metrics`);
    return true;
  } catch (error) {
    log.error(`Failed to create validation metrics: ${error.message}`);
    implementationState.errors.push(`Metrics: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'galaxy-outcomes-state.json';
  const updatedState = {
    ...implementationState,
    tractionMetricIds: implementationState.validationMetricIds // Maintain compatibility
  };
  fs.writeFileSync(stateFile, JSON.stringify(updatedState, null, 2));
  log.info(`State saved to ${stateFile}`);
}

// Main execution
async function main() {
  console.log('🌌 Galaxy Outcomes Update - Proof of Concept Focus');
  console.log('📊 Implementing Teresa Torres model with validation metrics');
  console.log('🎯 Business Outcome: Validate customer value with paid subscription');
  console.log('');
  
  // Use existing frame position
  if (!previousState.frameId || !previousState.framePosition) {
    log.error('No previous Galaxy Outcomes frame found');
    console.log('Please run galaxy-outcomes-implementation.js first');
    return;
  }
  
  implementationState.frameId = previousState.frameId;
  implementationState.framePosition = previousState.framePosition;
  
  // Delete existing items
  const cleanupSuccess = await deleteExistingItems();
  if (!cleanupSuccess) {
    log.error('Cleanup failed, continuing anyway...');
  }
  
  // Create updated outcomes
  const outcomesCreated = await createUpdatedOutcomes();
  if (!outcomesCreated) {
    log.error('Failed to create updated outcomes');
    saveState();
    return;
  }
  
  // Create validation metrics
  const metricsCreated = await createValidationMetrics();
  if (!metricsCreated) {
    log.error('Failed to create validation metrics');
    saveState();
    return;
  }
  
  // Final report
  log.phase('🎉 UPDATE COMPLETE!');
  console.log('📊 Galaxy Outcomes updated for proof of concept:');
  console.log(`   ✅ 1 Business Outcome (lagging): Validate paid subscription`);
  console.log(`   ✅ ${implementationState.productOutcomeIds.length} Product Outcomes (leading indicators)`);
  console.log(`   ✅ ${implementationState.leadingIndicatorIds.length} Supporting Behaviors`);
  console.log(`   ✅ ${implementationState.validationMetricIds.length} Validation Metrics`);
  console.log(`   ✅ ${implementationState.connectorIds.length} Parent-child connections`);
  
  console.log('\n📈 Key Leading Indicators:');
  console.log('   • Time to first insight < 15 minutes');
  console.log('   • 3+ sessions in first week');
  console.log('   • Willingness to pay signals within 30 days');
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Based on Universal Metaphor Product Discovery Report');
  console.log('🚀 Focus: Early validation of customer value proposition');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}