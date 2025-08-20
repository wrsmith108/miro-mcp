#!/usr/bin/env node

/**
 * Teresa Torres Implementation Executor
 * 
 * This script provides the complete implementation once API access is resolved.
 * Run with: node execute-teresa-implementation.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200, // ms between API calls
  BATCH_SIZE: 10,
  
  // Teresa Torres Colors
  COLORS: {
    OUTCOME: 'blue',           // Blue
    OPPORTUNITY: 'light_green', // Light Green  
    SOLUTION: 'yellow',        // Yellow
    EXPERIMENT: 'dark_blue'    // Dark Blue
  },
  
  // Board Layout
  LAYOUT: {
    OUTCOME_POS: { x: 1400, y: 100 },
    OPPORTUNITY_ROW: { y: 400, startX: 800, spacing: 250 },
    SOLUTION_ROW: { y: 600, spacing: 80 },
    EXPERIMENT_ROW: { y: 800 }
  }
};

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Utility Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🔧 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// Data Structures
const OPPORTUNITIES = [
  'Users struggle with feature discovery',
  'Onboarding lacks engagement hooks', 
  'Navigation feels overwhelming',
  'Value proposition unclear',
  'Habit formation missing',
  'Feedback loops inadequate'
];

const SOLUTION_SETS = [
  ['Guided tour feature', 'Interactive onboarding', 'Progressive disclosure'],
  ['Welcome video series', 'Achievement badges', 'Personal progress tracking'],
  ['Simplified menu structure', 'Search functionality', 'Contextual help'],
  ['Clear benefit statements', 'Use case examples', 'Success stories'],
  ['Daily check-in prompts', 'Habit streak tracking', 'Weekly goals'],
  ['User feedback widgets', 'Usage analytics', 'Performance metrics']
];

const EXPERIMENTS = [
  'A/B test tooltip vs modal',
  'User interview: navigation pain points', 
  'Heat map analysis',
  'Prototype usability test',
  'Survey: feature importance',
  'Analytics: engagement metrics'
];

// Implementation State
let implementationState = {
  phase: 0,
  outcomeId: null,
  opportunityIds: [],
  solutionIdsByOpportunity: {},
  experimentIds: [],
  connectorIds: [],
  errors: []
};

// Phase Implementations
async function testConnection() {
  log.phase('CONNECTION TEST');
  
  try {
    // Test basic connectivity
    const boardsResponse = await miroApi.get('/boards');
    log.success(`Token valid - ${boardsResponse.data.data.length} accessible boards`);
    
    // Test board access
    const itemsResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?limit=10`);
    log.success(`Board access confirmed - found items`);
    
    return true;
  } catch (error) {
    log.error(`Connection failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function phase0_createFramework() {
  log.phase('PHASE 0: FRAMEWORK SETUP');
  
  try {
    // Create Primary Outcome
    log.info('Creating PRIMARY OUTCOME sticky...');
    const outcomeResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'PRIMARY OUTCOME: Increase user engagement by 25% through improved discovery features',
        shape: 'square'
      },
      position: CONFIG.LAYOUT.OUTCOME_POS,
      style: {
        fillColor: CONFIG.COLORS.OUTCOME
      }
    });
    
    implementationState.outcomeId = outcomeResponse.data.data.id;
    log.success(`Created PRIMARY OUTCOME: ${outcomeResponse.data.data.id}`);
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create Opportunities
    log.info('Creating opportunity structure...');
    for (let i = 0; i < OPPORTUNITIES.length; i++) {
      const position = {
        x: CONFIG.LAYOUT.OPPORTUNITY_ROW.startX + (i * CONFIG.LAYOUT.OPPORTUNITY_ROW.spacing),
        y: CONFIG.LAYOUT.OPPORTUNITY_ROW.y
      };
      
      const oppResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: { 
          content: OPPORTUNITIES[i],
          shape: 'square'
        },
        position,
        style: {
          fillColor: CONFIG.COLORS.OPPORTUNITY
        }
      });
      
      implementationState.opportunityIds.push(oppResponse.data.id);
      log.success(`Created opportunity ${i + 1}: ${oppResponse.data.id}`);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create connector from outcome to opportunity
      try {
        const connectorResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
          startItem: { id: implementationState.outcomeId },
          endItem: { id: oppResponse.data.id },
          style: {
            startStrokeCap: 'none',
            endStrokeCap: 'arrow'
          }
        });
        
        implementationState.connectorIds.push(connectorResponse.data.id);
        log.success(`Connected outcome to opportunity ${i + 1}`);
        await sleep(100);
      } catch (connectorError) {
        log.warning(`Failed to create connector ${i + 1}: ${connectorError.message}`);
        implementationState.errors.push(`Connector ${i + 1}: ${connectorError.message}`);
      }
    }
    
    implementationState.phase = 1;
    return true;
  } catch (error) {
    log.error(`Phase 0 failed: ${error.message}`);
    if (error.response) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    implementationState.errors.push(`Phase 0: ${error.message}`);
    return false;
  }
}

async function phase1_createSolutions() {
  log.phase('PHASE 1: SOLUTION CREATION');
  
  try {
    for (let i = 0; i < implementationState.opportunityIds.length; i++) {
      const opportunityId = implementationState.opportunityIds[i];
      const solutions = SOLUTION_SETS[i] || [];
      
      implementationState.solutionIdsByOpportunity[opportunityId] = [];
      
      log.info(`Creating solutions for opportunity ${i + 1}...`);
      
      for (let j = 0; j < solutions.length; j++) {
        const position = {
          x: CONFIG.LAYOUT.OPPORTUNITY_ROW.startX + (i * CONFIG.LAYOUT.OPPORTUNITY_ROW.spacing) + (j * CONFIG.LAYOUT.SOLUTION_ROW.spacing) - 80,
          y: CONFIG.LAYOUT.SOLUTION_ROW.y
        };
        
        const solutionResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: { 
            content: solutions[j],
            shape: 'square'
          },
          position,
          style: {
            fillColor: CONFIG.COLORS.SOLUTION
          }
        });
        
        implementationState.solutionIdsByOpportunity[opportunityId].push(solutionResponse.data.id);
        log.success(`Created solution: "${solutions[j]}"`);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Connect solution to opportunity
        try {
          const connectorResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: opportunityId },
            endItem: { id: solutionResponse.data.id },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow'
            }
          });
          
          implementationState.connectorIds.push(connectorResponse.data.id);
          log.success(`Connected solution to opportunity ${i + 1}`);
          await sleep(100);
        } catch (connectorError) {
          log.warning(`Failed to connect solution: ${connectorError.message}`);
          implementationState.errors.push(`Solution connector: ${connectorError.message}`);
        }
      }
    }
    
    implementationState.phase = 2;
    return true;
  } catch (error) {
    log.error(`Phase 1 failed: ${error.message}`);
    implementationState.errors.push(`Phase 1: ${error.message}`);
    return false;
  }
}

async function phase2_createExperiments() {
  log.phase('PHASE 2: EXPERIMENT CREATION');
  
  try {
    let experimentIndex = 0;
    
    for (const [opportunityId, solutionIds] of Object.entries(implementationState.solutionIdsByOpportunity)) {
      if (solutionIds.length > 0 && experimentIndex < EXPERIMENTS.length) {
        const oppIndex = implementationState.opportunityIds.indexOf(opportunityId);
        const position = {
          x: CONFIG.LAYOUT.OPPORTUNITY_ROW.startX + (oppIndex * CONFIG.LAYOUT.OPPORTUNITY_ROW.spacing),
          y: CONFIG.LAYOUT.EXPERIMENT_ROW.y
        };
        
        const experimentResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: { 
            content: EXPERIMENTS[experimentIndex],
            shape: 'square'
          },
          position,
          style: {
            fillColor: CONFIG.COLORS.EXPERIMENT
          }
        });
        
        implementationState.experimentIds.push(experimentResponse.data.id);
        log.success(`Created experiment: "${EXPERIMENTS[experimentIndex]}"`);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Connect experiment to first solution
        try {
          const connectorResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: solutionIds[0] },
            endItem: { id: experimentResponse.data.id },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow'
            }
          });
          
          implementationState.connectorIds.push(connectorResponse.data.id);
          log.success(`Connected experiment to solution`);
          await sleep(100);
        } catch (connectorError) {
          log.warning(`Failed to connect experiment: ${connectorError.message}`);
          implementationState.errors.push(`Experiment connector: ${connectorError.message}`);
        }
        
        experimentIndex++;
      }
    }
    
    implementationState.phase = 3;
    return true;
  } catch (error) {
    log.error(`Phase 2 failed: ${error.message}`);
    implementationState.errors.push(`Phase 2: ${error.message}`);
    return false;
  }
}

async function phase3_qualityAssurance() {
  log.phase('PHASE 3: QUALITY ASSURANCE');
  
  try {
    // Verify board structure
    const itemsResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items`);
    const items = itemsResponse.data.data;
    
    const stickyNotes = items.filter(item => item.type === 'sticky_note');
    const connectors = items.filter(item => item.type === 'connector');
    
    // Count by color
    const colorCounts = {
      outcome: 0,
      opportunity: 0,
      solution: 0,
      experiment: 0
    };
    
    stickyNotes.forEach(sticky => {
      const color = sticky.style?.fillColor;
      if (color === CONFIG.COLORS.OUTCOME) colorCounts.outcome++;
      else if (color === CONFIG.COLORS.OPPORTUNITY) colorCounts.opportunity++;
      else if (color === CONFIG.COLORS.SOLUTION) colorCounts.solution++;
      else if (color === CONFIG.COLORS.EXPERIMENT) colorCounts.experiment++;
    });
    
    // Report metrics
    log.info('📊 IMPLEMENTATION METRICS:');
    console.log(`   Outcomes: ${colorCounts.outcome} (expected: 1)`);
    console.log(`   Opportunities: ${colorCounts.opportunity} (expected: 6)`);
    console.log(`   Solutions: ${colorCounts.solution} (expected: 18)`);
    console.log(`   Experiments: ${colorCounts.experiment} (expected: 6)`);
    console.log(`   Connectors: ${connectors.length} (expected: 30+)`);
    console.log(`   Total Items: ${items.length}`);
    
    // Validation
    const validations = {
      hasOutcome: colorCounts.outcome >= 1,
      hasOpportunities: colorCounts.opportunity >= 6,
      hasSolutions: colorCounts.solution >= 12,
      hasExperiments: colorCounts.experiment >= 3,
      hasConnectors: connectors.length >= 15
    };
    
    const allValid = Object.values(validations).every(v => v);
    
    if (allValid) {
      log.success('All validations passed! ✨');
    } else {
      log.warning('Some validations failed:');
      Object.entries(validations).forEach(([key, valid]) => {
        if (!valid) console.log(`   ❌ ${key}`);
      });
    }
    
    return allValid;
  } catch (error) {
    log.error(`Phase 3 failed: ${error.message}`);
    return false;
  }
}

// Cleanup function for blank stickies (when needed)
async function cleanupBlankStickies() {
  log.phase('CLEANUP: REMOVING BLANK STICKIES');
  
  try {
    const itemsResponse = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items`);
    const items = itemsResponse.data.data;
    
    const blankStickies = items.filter(item => 
      item.type === 'sticky_note' && 
      (!item.data?.content || item.data.content.trim() === '')
    );
    
    log.info(`Found ${blankStickies.length} blank stickies to remove`);
    
    // Remove in batches
    for (let i = 0; i < blankStickies.length; i += CONFIG.BATCH_SIZE) {
      const batch = blankStickies.slice(i, i + CONFIG.BATCH_SIZE);
      
      for (const sticky of batch) {
        try {
          await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${sticky.id}`);
          log.success(`Deleted blank sticky: ${sticky.id}`);
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        } catch (deleteError) {
          log.warning(`Failed to delete ${sticky.id}: ${deleteError.message}`);
        }
      }
      
      log.info(`Processed batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}`);
    }
    
    return true;
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveImplementationState() {
  const stateFile = 'teresa-implementation-state.json';
  fs.writeFileSync(stateFile, JSON.stringify(implementationState, null, 2));
  log.info(`Implementation state saved to ${stateFile}`);
}

// Main execution function
async function main() {
  console.log('🎯 Teresa Torres Continuous Discovery Habits Implementation');
  console.log('📋 Building Opportunity Solution Tree Structure');
  console.log('');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    log.error('Cannot proceed without API access. Please check:');
    console.log('  1. Board ID format: uXjVJS1vI0k=');
    console.log('  2. Token permissions: boards:read, boards:write');
    console.log('  3. Board access: user must be collaborator');
    console.log('');
    console.log('📖 See TERESA-TORRES-IMPLEMENTATION-GUIDE.md for troubleshooting');
    return;
  }
  
  // Execute phases sequentially
  const phases = [
    { name: 'Framework Setup', func: phase0_createFramework },
    { name: 'Solution Creation', func: phase1_createSolutions },
    { name: 'Experiment Creation', func: phase2_createExperiments },
    { name: 'Quality Assurance', func: phase3_qualityAssurance }
  ];
  
  for (const phase of phases) {
    const success = await phase.func();
    if (!success) {
      log.error(`Implementation stopped at: ${phase.name}`);
      saveImplementationState();
      return;
    }
  }
  
  // Optional cleanup of blank stickies
  const shouldCleanup = process.argv.includes('--cleanup');
  if (shouldCleanup) {
    await cleanupBlankStickies();
  }
  
  // Final report
  log.phase('🎉 IMPLEMENTATION COMPLETE!');
  console.log('📊 Teresa Torres Opportunity Solution Tree created with:');
  console.log(`   ✅ 1 Primary Outcome (blue)`);
  console.log(`   ✅ ${implementationState.opportunityIds.length} Opportunities (light green)`);
  console.log(`   ✅ ${Object.values(implementationState.solutionIdsByOpportunity).flat().length} Solutions (yellow)`);
  console.log(`   ✅ ${implementationState.experimentIds.length} Experiments (dark blue)`);
  console.log(`   ✅ ${implementationState.connectorIds.length} Connectors`);
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Methodology guide: TERESA-TORRES-IMPLEMENTATION-GUIDE.md');
  
  saveImplementationState();
}

if (require.main === module) {
  main().catch(console.error);
}