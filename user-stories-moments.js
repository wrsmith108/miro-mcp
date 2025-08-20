#!/usr/bin/env node

// User Stories and Key Moments - Teresa Torres Method
// Based on Universal Metaphor Product Discovery Report Section 2

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200,
  
  // Color scheme for Teresa Torres journey mapping
  COLORS: {
    JOURNEY_PHASE: 'dark_green',      // High-level journey phases
    KEY_MOMENT: 'green',               // Specific moments (labeled)
    USER_STORY: 'light_yellow',        // User stories
    PAIN_POINT: 'red',                 // Pain points/problems
    OPPORTUNITY: 'light_green',        // Opportunities
    LABEL: 'gray'                      // Labels and headers
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

// User Journey Structure from Discovery Report Section 2
const JOURNEY_STRUCTURE = {
  phases: [
    {
      title: 'INITIAL SETUP & ONBOARDING',
      keyMoments: [
        {
          moment: 'First data source selection',
          label: 'KEY MOMENT',
          stories: [
            'As a new user, I want to quickly connect my data source so I can start exploring',
            'As a non-technical user, I want guidance on which data format to use',
            'As a user, I want to preview my data before committing to the upload'
          ],
          painPoints: [
            'Confusion about supported formats',
            'No clear starting point',
            'Fear of making wrong choice'
          ]
        },
        {
          moment: 'Understanding spatial vs visual attributes',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want to understand the difference between spatial and visual mapping',
            'As a user, I want recommendations for which attributes to use where',
            'As a user, I want to see examples of effective attribute combinations'
          ],
          painPoints: [
            '"I don\'t know what the difference is" - Mitch',
            'Mental model mismatch with 3D space',
            'Too many options presented at once'
          ]
        },
        {
          moment: 'Initial galaxy navigation',
          label: 'KEY MOMENT',
          stories: [
            'As a first-time user, I want intuitive 3D navigation controls',
            'As a user, I want to quickly orient myself in the galaxy view',
            'As a user, I want to return to familiar viewpoints easily'
          ],
          painPoints: [
            'Disorientation in 3D space',
            'Complex control scheme',
            'No reference points'
          ]
        }
      ]
    },
    {
      title: 'DATA EXPLORATION & ANALYSIS',
      keyMoments: [
        {
          moment: 'Attribute mapping decisions',
          label: 'KEY MOMENT',
          stories: [
            'As an analyst, I want to map the most important metrics to spatial dimensions',
            'As a user, I want to combine multiple metrics into calculated fields',
            'As a user, I want to save successful attribute combinations for reuse'
          ],
          painPoints: [
            'Current model doesn\'t match mental models',
            'Cannot create aggregate metrics',
            'Too many simultaneous decisions'
          ]
        },
        {
          moment: 'Threshold adjustments',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want to filter out noise and focus on significant data',
            'As a user, I want to dynamically adjust thresholds and see immediate results',
            'As a user, I want to understand the impact of threshold changes'
          ],
          painPoints: [
            'Unclear threshold effects',
            'Lost context during adjustments',
            'No undo/redo capability'
          ]
        },
        {
          moment: 'Pattern recognition',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want the system to highlight unusual patterns automatically',
            'As a user, I want to compare patterns across different time periods',
            'As a user, I want to annotate discovered patterns for later reference'
          ],
          painPoints: [
            'Patterns not immediately visible',
            'Cognitive overload from 7+ attributes',
            'No pattern persistence'
          ]
        }
      ]
    },
    {
      title: 'INSIGHT DISCOVERY',
      keyMoments: [
        {
          moment: 'Identifying valuable data points',
          label: 'KEY MOMENT',
          stories: [
            'As a decision maker, I want to quickly identify outliers and high-value items',
            'As a user, I want to understand why certain items are highlighted',
            'As a user, I want to create custom value definitions'
          ],
          painPoints: [
            'Equal visual weight to all points',
            'Cannot identify own data vs others',
            'Value criteria unclear'
          ]
        },
        {
          moment: 'Comparing similar entities',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want to compare multiple items side-by-side',
            'As a user, I want to see relative strengths and weaknesses',
            'As a user, I want to group similar items for bulk analysis'
          ],
          painPoints: [
            'No comparison tools',
            'Lost in the galaxy view',
            'Cannot isolate comparisons'
          ]
        },
        {
          moment: 'Finding hidden relationships',
          label: 'KEY MOMENT',
          stories: [
            'As a researcher, I want to discover non-obvious connections',
            'As a user, I want the system to suggest potential relationships',
            'As a user, I want to validate discovered relationships with data'
          ],
          painPoints: [
            'Relationships not surfaced',
            'Too much visual complexity',
            'No relationship validation'
          ]
        }
      ]
    },
    {
      title: 'DECISION MAKING',
      keyMoments: [
        {
          moment: 'Selecting optimal candidates',
          label: 'KEY MOMENT',
          stories: [
            'As a decision maker, I want to shortlist the best options based on multiple criteria',
            'As a user, I want to document why I selected certain candidates',
            'As a user, I want to export my selections for further action'
          ],
          painPoints: [
            'No selection persistence',
            'Cannot annotate choices',
            'No export functionality'
          ]
        },
        {
          moment: 'Trade-off evaluation',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want to understand the trade-offs between different options',
            'As a user, I want to adjust weights and see impact on rankings',
            'As a user, I want to simulate different scenarios'
          ],
          painPoints: [
            'Trade-offs not explicit',
            'Cannot adjust preferences',
            'No scenario comparison'
          ]
        },
        {
          moment: 'Action commitment',
          label: 'KEY MOMENT',
          stories: [
            'As a user, I want to confidently commit to decisions based on the insights',
            'As a user, I want an audit trail of my decision process',
            'As a user, I want to share my reasoning with stakeholders'
          ],
          painPoints: [
            'Low confidence in decisions',
            'No decision documentation',
            'Cannot share specific views'
          ]
        }
      ]
    }
  ]
};

// Implementation state
let implementationState = {
  frameId: null,
  framePosition: null,
  journeyPhaseIds: [],
  keyMomentIds: [],
  userStoryIds: [],
  painPointIds: [],
  connectorIds: [],
  errors: []
};

// Find the User Stories frame
async function findUserStoriesFrame() {
  log.phase('FINDING USER STORIES FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    const userStoriesFrame = frames.find(frame => 
      frame.data && frame.data.title && 
      (frame.data.title.toLowerCase().includes('user stories') || 
       frame.data.title.toLowerCase().includes('user story'))
    );
    
    if (userStoriesFrame) {
      implementationState.frameId = userStoriesFrame.id;
      implementationState.framePosition = userStoriesFrame.position;
      log.success(`Found User Stories frame at position (${userStoriesFrame.position.x}, ${userStoriesFrame.position.y})`);
      return true;
    } else {
      log.error('User Stories frame not found');
      return false;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return false;
  }
}

// Create journey mapping structure
async function createJourneyMapping() {
  log.phase('CREATING USER JOURNEY MAPPING');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startY = frameY - 400;
    
    // Create main header
    log.info('Creating journey mapping header...');
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'USER JOURNEY MOMENTS\n(Teresa Torres Method)',
        shape: 'rectangle'
      },
      position: { x: frameX, y: startY - 100 },
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Process each journey phase
    for (let phaseIndex = 0; phaseIndex < JOURNEY_STRUCTURE.phases.length; phaseIndex++) {
      const phase = JOURNEY_STRUCTURE.phases[phaseIndex];
      const phaseX = frameX - 600 + (phaseIndex * 500);
      const phaseY = startY;
      
      log.info(`Creating phase: ${phase.title}...`);
      
      // Create phase header
      const phaseResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: phase.title,
          shape: 'rectangle'
        },
        position: { x: phaseX, y: phaseY },
        style: { fillColor: CONFIG.COLORS.JOURNEY_PHASE }
      });
      implementationState.journeyPhaseIds.push(phaseResponse.data.id);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Create key moments for this phase
      for (let momentIndex = 0; momentIndex < phase.keyMoments.length; momentIndex++) {
        const keyMoment = phase.keyMoments[momentIndex];
        const momentY = phaseY + 150 + (momentIndex * 400);
        
        // Create KEY MOMENT label
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: keyMoment.label,
            shape: 'square'
          },
          position: { x: phaseX - 150, y: momentY },
          style: { fillColor: CONFIG.COLORS.LABEL }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Create the key moment itself
        const momentResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: keyMoment.moment,
            shape: 'square'
          },
          position: { x: phaseX, y: momentY },
          style: { fillColor: CONFIG.COLORS.KEY_MOMENT }
        });
        const momentId = momentResponse.data.id;
        implementationState.keyMomentIds.push(momentId);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Connect phase to moment
        try {
          const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: phaseResponse.data.id },
            endItem: { id: momentId },
            style: { 
              startStrokeCap: 'none', 
              endStrokeCap: 'arrow',
              strokeColor: '#1a1a1a',
              strokeStyle: 'normal'
            }
          });
          implementationState.connectorIds.push(connector.data.id);
        } catch (err) {
          // Continue if connector fails
        }
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Create user stories
        for (let storyIndex = 0; storyIndex < keyMoment.stories.length; storyIndex++) {
          const story = keyMoment.stories[storyIndex];
          const storyX = phaseX + 200;
          const storyY = momentY - 50 + (storyIndex * 60);
          
          const storyResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
            data: {
              content: story,
              shape: 'square'
            },
            position: { x: storyX, y: storyY },
            style: { fillColor: CONFIG.COLORS.USER_STORY }
          });
          implementationState.userStoryIds.push(storyResponse.data.id);
          
          // Connect moment to story
          try {
            const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
              startItem: { id: momentId },
              endItem: { id: storyResponse.data.id },
              style: { 
                startStrokeCap: 'none', 
                endStrokeCap: 'none',
                strokeColor: '#666666',
                strokeStyle: 'dashed'
              }
            });
            implementationState.connectorIds.push(connector.data.id);
          } catch (err) {
            // Continue if connector fails
          }
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        }
        
        // Create pain points
        for (let painIndex = 0; painIndex < keyMoment.painPoints.length; painIndex++) {
          const painPoint = keyMoment.painPoints[painIndex];
          const painX = phaseX - 200;
          const painY = momentY - 50 + (painIndex * 60);
          
          const painResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
            data: {
              content: `⚠️ ${painPoint}`,
              shape: 'square'
            },
            position: { x: painX, y: painY },
            style: { fillColor: CONFIG.COLORS.PAIN_POINT }
          });
          implementationState.painPointIds.push(painResponse.data.id);
          
          // Connect moment to pain point
          try {
            const connector = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
              startItem: { id: momentId },
              endItem: { id: painResponse.data.id },
              style: { 
                startStrokeCap: 'none', 
                endStrokeCap: 'none',
                strokeColor: '#ff0000',
                strokeStyle: 'dotted'
              }
            });
            implementationState.connectorIds.push(connector.data.id);
          } catch (err) {
            // Continue if connector fails
          }
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        }
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create journey mapping: ${error.message}`);
    implementationState.errors.push(`Journey: ${error.message}`);
    return false;
  }
}

// Create summary section
async function createSummarySection() {
  log.phase('CREATING SUMMARY SECTION');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const summaryY = frameY + 1200;
    
    // Create summary header
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY INSIGHTS FROM USER JOURNEY',
        shape: 'rectangle'
      },
      position: { x: frameX, y: summaryY },
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Critical insights
    const insights = [
      'Critical: Users abandon within 10 minutes due to complexity',
      'Critical: Spatial vs visual attribute confusion is universal',
      'Critical: 7+ simultaneous attributes exceed cognitive capacity',
      'Opportunity: AI-assisted setup expected by users',
      'Opportunity: Progressive disclosure needed for complexity',
      'Opportunity: Templates would accelerate value discovery'
    ];
    
    for (let i = 0; i < insights.length; i++) {
      const insightX = frameX - 300 + (i % 3) * 300;
      const insightY = summaryY + 100 + Math.floor(i / 3) * 100;
      const isOpportunity = insights[i].startsWith('Opportunity');
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: insights[i],
          shape: 'square'
        },
        position: { x: insightX, y: insightY },
        style: { 
          fillColor: isOpportunity ? CONFIG.COLORS.OPPORTUNITY : CONFIG.COLORS.PAIN_POINT 
        }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create summary: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'user-stories-state.json';
  fs.writeFileSync(stateFile, JSON.stringify(implementationState, null, 2));
  log.info(`State saved to ${stateFile}`);
}

// Main execution
async function main() {
  console.log('🎭 User Stories and Key Moments Implementation');
  console.log('📊 Using Teresa Torres Method for Journey Mapping');
  console.log('📖 Based on Universal Metaphor Product Discovery Report');
  console.log('');
  
  // Find the User Stories frame
  const frameFound = await findUserStoriesFrame();
  if (!frameFound) {
    log.error('Cannot proceed without User Stories frame');
    console.log('\nPlease ensure you have a frame titled "User stories and key moments" on your board');
    return;
  }
  
  // Create journey mapping
  const journeyCreated = await createJourneyMapping();
  if (!journeyCreated) {
    log.error('Failed to create journey mapping');
    saveState();
    return;
  }
  
  // Create summary section
  const summaryCreated = await createSummarySection();
  if (!summaryCreated) {
    log.error('Failed to create summary section');
  }
  
  // Final report
  log.phase('🎉 IMPLEMENTATION COMPLETE!');
  console.log('📊 User Journey Mapping created with:');
  console.log(`   ✅ ${JOURNEY_STRUCTURE.phases.length} Journey Phases`);
  console.log(`   ✅ ${implementationState.keyMomentIds.length} Key Moments (labeled)`);
  console.log(`   ✅ ${implementationState.userStoryIds.length} User Stories`);
  console.log(`   ✅ ${implementationState.painPointIds.length} Pain Points`);
  console.log(`   ✅ ${implementationState.connectorIds.length} Connections`);
  
  console.log('\n🎯 Journey Phases:');
  console.log('   1. Initial Setup & Onboarding');
  console.log('   2. Data Exploration & Analysis');
  console.log('   3. Insight Discovery');
  console.log('   4. Decision Making');
  
  console.log('\n🔑 Critical Moments Identified:');
  console.log('   • First data source selection');
  console.log('   • Understanding spatial vs visual attributes');
  console.log('   • Attribute mapping decisions');
  console.log('   • Pattern recognition');
  console.log('   • Finding hidden relationships');
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres: Journey moments → Opportunities → Solutions');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}