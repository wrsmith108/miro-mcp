#!/usr/bin/env node

// Direct Teresa Torres implementation using raw Miro API calls
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BOARD_ID = 'uXjVJS1vI0k=';
const ACCESS_TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_J9FguRQ-s5E5GkzQB216o1RYM-o';

console.log('🚀 Starting Direct Teresa Torres Implementation');
console.log(`Board ID: ${BOARD_ID}`);
console.log(`Token: ${ACCESS_TOKEN.substring(0, 20)}...`);

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Teresa Torres Color System
const COLORS = {
  OUTCOME: '#2D9BF0',      // Blue - Desired outcomes at top of tree
  OPPORTUNITY: '#8FD14F',  // Light Green - Opportunities from research
  SOLUTION: '#FEF445',     // Yellow - Solution ideas under opportunities  
  EXPERIMENT: '#0062FF'    // Dark Blue - Tests for riskiest assumptions
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function phase0_setupFramework() {
  console.log('\n🔧 PHASE 0: Framework Setup');
  console.log('═'.repeat(50));
  
  try {
    // Step 1: Create the primary outcome at top center
    console.log('1. Creating PRIMARY OUTCOME...');
    const outcomeResponse = await miroApi.post(`/boards/${BOARD_ID}/sticky_notes`, {
      data: {
        content: 'PRIMARY OUTCOME: Increase user engagement by 25% through improved discovery features'
      },
      position: { x: 1400, y: 100 },
      style: {
        fillColor: COLORS.OUTCOME,
        textColor: '#FFFFFF'
      }
    });
    
    console.log(`✅ Created PRIMARY OUTCOME sticky: ${outcomeResponse.data.id}`);
    await sleep(200); // Rate limiting
    
    // Step 2: Create initial opportunity structure
    console.log('2. Creating opportunity structure...');
    const opportunities = [
      'Users struggle with feature discovery',
      'Onboarding lacks engagement hooks', 
      'Navigation feels overwhelming',
      'Value proposition unclear',
      'Habit formation missing',
      'Feedback loops inadequate'
    ];
    
    const opportunityIds = [];
    for (let i = 0; i < opportunities.length; i++) {
      const x = 800 + (i * 250); // Spread horizontally
      const y = 400;
      
      const oppResponse = await miroApi.post(`/boards/${BOARD_ID}/sticky_notes`, {
        data: { content: opportunities[i] },
        position: { x, y },
        style: {
          fillColor: COLORS.OPPORTUNITY,
          textColor: '#000000'
        }
      });
      
      opportunityIds.push(oppResponse.data.id);
      console.log(`✅ Created opportunity ${i + 1}: ${oppResponse.data.id}`);
      await sleep(200);
      
      // Create connector from outcome to opportunity
      try {
        await miroApi.post(`/boards/${BOARD_ID}/connectors`, {
          startItem: { id: outcomeResponse.data.id },
          endItem: { id: oppResponse.data.id },
          style: {
            startStrokeCap: 'none',
            endStrokeCap: 'arrow'
          }
        });
        console.log(`✅ Connected outcome to opportunity ${i + 1}`);
        await sleep(100);
      } catch (connectorError) {
        console.log(`⚠️  Failed to create connector ${i + 1}: ${connectorError.message}`);
      }
    }
    
    return {
      success: true,
      outcomeId: outcomeResponse.data.id,
      opportunityIds
    };
    
  } catch (error) {
    console.error('❌ Phase 0 failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return { success: false, error };
  }
}

async function phase1_addSolutions(opportunityIds) {
  console.log('\n💡 PHASE 1: Add Solution Ideas');
  console.log('═'.repeat(50));
  
  const solutionIdsByOpportunity = {};
  
  const solutionSets = [
    ['Guided tour feature', 'Interactive onboarding', 'Progressive disclosure'],
    ['Welcome video series', 'Achievement badges', 'Personal progress tracking'],
    ['Simplified menu structure', 'Search functionality', 'Contextual help'],
    ['Clear benefit statements', 'Use case examples', 'Success stories'],
    ['Daily check-in prompts', 'Habit streak tracking', 'Weekly goals'],
    ['User feedback widgets', 'Usage analytics', 'Performance metrics']
  ];
  
  for (let i = 0; i < opportunityIds.length && i < solutionSets.length; i++) {
    const solutions = solutionSets[i];
    solutionIdsByOpportunity[opportunityIds[i]] = [];
    
    for (let j = 0; j < solutions.length; j++) {
      const x = 800 + (i * 250) + (j * 80) - 80; // Position under opportunity
      const y = 600;
      
      try {
        const solutionResponse = await miroApi.post(`/boards/${BOARD_ID}/sticky_notes`, {
          data: { content: solutions[j] },
          position: { x, y },
          style: {
            fillColor: COLORS.SOLUTION,
            textColor: '#000000'
          }
        });
        
        solutionIdsByOpportunity[opportunityIds[i]].push(solutionResponse.data.id);
        console.log(`✅ Created solution: "${solutions[j]}"`);
        await sleep(200);
        
        // Connect to parent opportunity
        try {
          await miroApi.post(`/boards/${BOARD_ID}/connectors`, {
            startItem: { id: opportunityIds[i] },
            endItem: { id: solutionResponse.data.id },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow'
            }
          });
          console.log(`✅ Connected solution to opportunity ${i + 1}`);
          await sleep(100);
        } catch (connectorError) {
          console.log(`⚠️  Failed to connect solution: ${connectorError.message}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create solution "${solutions[j]}":`, error.message);
      }
    }
  }
  
  return solutionIdsByOpportunity;
}

async function phase2_addExperiments(solutionIdsByOpportunity) {
  console.log('\n🧪 PHASE 2: Add Experiments');
  console.log('═'.repeat(50));
  
  const experiments = [
    'A/B test tooltip vs modal',
    'User interview: navigation pain points', 
    'Heat map analysis',
    'Prototype usability test',
    'Survey: feature importance',
    'Analytics: engagement metrics'
  ];
  
  let experimentIndex = 0;
  
  for (const [opportunityId, solutionIds] of Object.entries(solutionIdsByOpportunity)) {
    if (solutionIds.length > 0 && experimentIndex < experiments.length) {
      // Add experiment under first solution of each opportunity
      const x = 800 + (Object.keys(solutionIdsByOpportunity).indexOf(opportunityId) * 250);
      const y = 800;
      
      try {
        const experimentResponse = await miroApi.post(`/boards/${BOARD_ID}/sticky_notes`, {
          data: { content: experiments[experimentIndex] },
          position: { x, y },
          style: {
            fillColor: COLORS.EXPERIMENT,
            textColor: '#FFFFFF'
          }
        });
        
        console.log(`✅ Created experiment: "${experiments[experimentIndex]}"`);
        await sleep(200);
        
        // Connect to solution
        try {
          await miroApi.post(`/boards/${BOARD_ID}/connectors`, {
            startItem: { id: solutionIds[0] },
            endItem: { id: experimentResponse.data.id },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow'
            }
          });
          console.log(`✅ Connected experiment to solution`);
          await sleep(100);
        } catch (connectorError) {
          console.log(`⚠️  Failed to connect experiment: ${connectorError.message}`);
        }
        
        experimentIndex++;
      } catch (error) {
        console.error(`❌ Failed to create experiment: ${error.message}`);
      }
    }
  }
}

async function main() {
  console.log('🎯 Teresa Torres Continuous Discovery Habits Implementation');
  console.log('📋 Building Opportunity Solution Tree Structure');
  console.log('');
  
  // Phase 0: Setup Framework
  const phase0Result = await phase0_setupFramework();
  if (!phase0Result.success) {
    console.log('❌ Stopping due to Phase 0 failure');
    return;
  }
  
  // Phase 1: Add Solutions  
  const solutionIds = await phase1_addSolutions(phase0Result.opportunityIds);
  
  // Phase 2: Add Experiments
  await phase2_addExperiments(solutionIds);
  
  console.log('\n🎉 Teresa Torres implementation completed!');
  console.log('📊 Board now contains:');
  console.log('   ✅ 1 Primary Outcome (blue)');
  console.log('   ✅ 6 Opportunities (light green)');
  console.log('   ✅ ~18 Solution Ideas (yellow)');
  console.log('   ✅ 6 Experiments (dark blue)');
  console.log('   ✅ Parent-child connectors');
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
}

if (require.main === module) {
  main().catch(console.error);
}