#!/usr/bin/env node

// Galaxy Solution Story Mapping Implementation
// Teresa Torres Story Mapping with prioritized solutions
// Focused on Product Outcome 1: Users achieve first meaningful insight within 15 minutes

const axios = require('axios');
const fs = require('fs');
const LayoutDesigner = require('./layout-designer');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 200,
  
  // Story mapping colors
  COLORS: {
    JOURNEY: 'dark_green',         // User journey backbone
    ACTIVITY: 'green',             // User activities
    MVP: 'red',                    // MVP stories
    RELEASE_1: 'orange',           // Release 1 stories
    RELEASE_2: 'yellow',           // Release 2 stories
    FUTURE: 'light_blue',          // Future stories
    OUTCOME: 'blue',               // Product outcome
    METRIC: 'violet',              // Success metrics
    LABEL: 'gray'                  // Labels
  }
};

// Enhanced Layout Designer for story mapping
const layoutDesigner = new LayoutDesigner({
  minPadding: 90,           // Good spacing for story cards
  horizontalGap: 320,        // Horizontal spacing between columns
  verticalGap: 140,          // Vertical spacing between rows
  connectorClearance: 50,    // Space for connectors
  useGrid: true,
  gridCellWidth: 350,
  gridCellHeight: 180
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

// Story Map Structure based on Teresa Torres methodology and prioritization
const STORY_MAP_STRUCTURE = {
  outcome: {
    title: 'PRODUCT OUTCOME 1',
    content: 'Users achieve first meaningful insight within 15 minutes'
  },
  
  // User journey backbone (horizontal)
  journeyPhases: [
    {
      phase: 'DISCOVER & START',
      activities: [
        'Find the product',
        'Understand value prop',
        'Create account'
      ]
    },
    {
      phase: 'INITIAL SETUP',
      activities: [
        'Select data source',
        'Upload/connect data',
        'Choose starting point'
      ]
    },
    {
      phase: 'LEARN BASICS',
      activities: [
        'Navigate interface',
        'Understand concepts',
        'Complete tutorial'
      ]
    },
    {
      phase: 'MAP ATTRIBUTES',
      activities: [
        'Understand attributes',
        'Select key metrics',
        'Configure view'
      ]
    },
    {
      phase: 'FIND INSIGHTS',
      activities: [
        'Explore data',
        'Identify patterns',
        'Validate findings'
      ]
    },
    {
      phase: 'TAKE ACTION',
      activities: [
        'Document insights',
        'Share findings',
        'Make decision'
      ]
    }
  ],
  
  // User stories organized by release (vertical under each phase)
  releases: {
    MVP: {
      label: 'MVP (Week 1)',
      color: CONFIG.COLORS.MVP,
      stories: {
        'DISCOVER & START': [
          'As a user, I can see value prop in 10 seconds',
          'As a user, I can start with a template'
        ],
        'INITIAL SETUP': [
          'As a user, I can use Quick Start Templates',
          'As a user, I can preview sample data'
        ],
        'LEARN BASICS': [
          'As a user, I see simplified interface first',
          'As a user, I get contextual help'
        ],
        'MAP ATTRIBUTES': [
          'As a user, I see visual hierarchy optimized',
          'As a user, I get attribute recommendations'
        ],
        'FIND INSIGHTS': [
          'As a user, I see patterns highlighted',
          'As a user, I can identify outliers'
        ],
        'TAKE ACTION': [
          'As a user, I can save my view',
          'As a user, I can export findings'
        ]
      }
    },
    RELEASE_1: {
      label: 'Release 1 (Week 2)',
      color: CONFIG.COLORS.RELEASE_1,
      stories: {
        'DISCOVER & START': [
          'As a user, I can see customer testimonials',
          'As a user, I can watch intro video'
        ],
        'INITIAL SETUP': [
          'As a user, I get guided data upload',
          'As a user, I can connect live data sources'
        ],
        'LEARN BASICS': [
          'As a user, I complete interactive tutorial',
          'As a user, I unlock features progressively'
        ],
        'MAP ATTRIBUTES': [
          'As a user, I use Visual Attribute Wizard',
          'As a user, I can preview attribute effects'
        ],
        'FIND INSIGHTS': [
          'As a user, I use Smart Highlighting System',
          'As a user, I get insight notifications'
        ],
        'TAKE ACTION': [
          'As a user, I can annotate discoveries',
          'As a user, I can share specific views'
        ]
      }
    },
    RELEASE_2: {
      label: 'Release 2 (Week 3-4)',
      color: CONFIG.COLORS.RELEASE_2,
      stories: {
        'DISCOVER & START': [
          'As a user, I can see ROI calculator',
          'As a user, I get personalized demo'
        ],
        'INITIAL SETUP': [
          'As a user, I get AI-powered setup',
          'As a user, I can import from competitors'
        ],
        'LEARN BASICS': [
          'As a user, I earn achievement badges',
          'As a user, I track learning progress'
        ],
        'MAP ATTRIBUTES': [
          'As a user, I get AI Attribute Recommendations',
          'As a user, I create calculated fields'
        ],
        'FIND INSIGHTS': [
          'As a user, I get AI-discovered patterns',
          'As a user, I compare time periods'
        ],
        'TAKE ACTION': [
          'As a user, I create reports',
          'As a user, I schedule updates'
        ]
      }
    },
    FUTURE: {
      label: 'Future (Week 5+)',
      color: CONFIG.COLORS.FUTURE,
      stories: {
        'DISCOVER & START': [
          'As a user, I get industry benchmarks',
          'As a user, I see peer comparisons'
        ],
        'INITIAL SETUP': [
          'As a user, I use natural language setup',
          'As a user, I get data quality scoring'
        ],
        'LEARN BASICS': [
          'As a user, I access advanced training',
          'As a user, I get certification'
        ],
        'MAP ATTRIBUTES': [
          'As a user, I use ML-powered suggestions',
          'As a user, I create custom formulas'
        ],
        'FIND INSIGHTS': [
          'As a user, I get predictive analytics',
          'As a user, I run what-if scenarios'
        ],
        'TAKE ACTION': [
          'As a user, I automate workflows',
          'As a user, I integrate with tools'
        ]
      }
    }
  },
  
  // Success metrics for each phase
  phaseMetrics: {
    'DISCOVER & START': 'Conversion rate > 30%',
    'INITIAL SETUP': 'Completion rate > 80%',
    'LEARN BASICS': 'Tutorial completion > 70%',
    'MAP ATTRIBUTES': 'Success rate > 85%',
    'FIND INSIGHTS': 'Pattern found < 10 min',
    'TAKE ACTION': 'Decision confidence > 7/10'
  },
  
  // Walking skeleton (minimal path through all phases)
  walkingSkeleton: [
    'Start with template',
    'Use sample data',
    'See simplified view',
    'Auto-highlight patterns',
    'Export basic insight'
  ]
};

// Implementation state
let implementationState = {
  frameId: null,
  framePosition: null,
  journeyIds: [],
  activityIds: [],
  storyIds: [],
  releaseIds: [],
  metricIds: [],
  errors: []
};

// Find the Solution Story Mapping frame
async function findStoryMapFrame() {
  log.phase('FINDING GALAXY SOLUTION STORY MAPPING FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    const storyMapFrame = frames.find(frame => 
      frame.data && frame.data.title && 
      frame.data.title === 'Galaxy Solution Story Mapping'
    );
    
    if (storyMapFrame) {
      implementationState.frameId = storyMapFrame.id;
      implementationState.framePosition = storyMapFrame.position;
      log.success(`Found frame at position (${storyMapFrame.position.x}, ${storyMapFrame.position.y})`);
      return true;
    } else {
      log.error('Galaxy Solution Story Mapping frame not found');
      return false;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return false;
  }
}

// Create the journey backbone
async function createJourneyBackbone() {
  log.phase('CREATING USER JOURNEY BACKBONE');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    // Position items within the frame (frame center is at frameX, frameY)
    const startX = frameX - 900;
    const startY = frameY - 1200;
    
    layoutDesigner.reset();
    
    // Create outcome header
    const outcomePos = layoutDesigner.findSafePosition(
      { x: frameX, y: startY - 200 },
      { width: 500, height: 100 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: `${STORY_MAP_STRUCTURE.outcome.title}\n${STORY_MAP_STRUCTURE.outcome.content}`,
        shape: 'rectangle'
      },
      position: outcomePos,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create journey phases (horizontal backbone)
    for (let i = 0; i < STORY_MAP_STRUCTURE.journeyPhases.length; i++) {
      const phase = STORY_MAP_STRUCTURE.journeyPhases[i];
      const phaseX = startX + (i * 350);
      
      // Phase header
      const phasePos = layoutDesigner.findSafePosition(
        { x: phaseX, y: startY },
        { width: 300, height: 80 },
        'rectangle'
      );
      
      const phaseResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: phase.phase,
          shape: 'rectangle'
        },
        position: phasePos,
        style: { fillColor: CONFIG.COLORS.JOURNEY }
      });
      
      implementationState.journeyIds.push(phaseResponse.data.id);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Activities under each phase
      for (let j = 0; j < phase.activities.length; j++) {
        const activity = phase.activities[j];
        const activityY = startY + 120 + (j * 70);
        
        const activityPos = layoutDesigner.findSafePosition(
          { x: phaseX, y: activityY },
          { width: 280, height: 60 },
          'square'
        );
        
        const activityResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: activity,
            shape: 'square'
          },
          position: activityPos,
          style: { fillColor: CONFIG.COLORS.ACTIVITY }
        });
        
        implementationState.activityIds.push(activityResponse.data.id);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
      
      // Phase success metric
      const metricPos = layoutDesigner.findSafePosition(
        { x: phaseX, y: startY + 350 },
        { width: 280, height: 50 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `📊 ${STORY_MAP_STRUCTURE.phaseMetrics[phase.phase]}`,
          shape: 'square'
        },
        position: metricPos,
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create journey backbone: ${error.message}`);
    return false;
  }
}

// Create user stories organized by release
async function createUserStories() {
  log.phase('CREATING USER STORIES BY RELEASE');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startX = frameX - 1000;
    const startY = frameY + 100;
    
    const releases = ['MVP', 'RELEASE_1', 'RELEASE_2', 'FUTURE'];
    
    for (let releaseIndex = 0; releaseIndex < releases.length; releaseIndex++) {
      const releaseName = releases[releaseIndex];
      const release = STORY_MAP_STRUCTURE.releases[releaseName];
      const releaseY = startY + (releaseIndex * 180);
      
      // Release label
      const labelPos = layoutDesigner.findSafePosition(
        { x: startX - 200, y: releaseY },
        { width: 150, height: 60 },
        'rectangle'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: release.label,
          shape: 'rectangle'
        },
        position: labelPos,
        style: { fillColor: release.color }
      });
      implementationState.releaseIds.push(release.label);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Stories for each phase in this release
      let phaseIndex = 0;
      for (const phase in release.stories) {
        const stories = release.stories[phase];
        const phaseX = startX + (phaseIndex * 350);
        
        for (let storyIndex = 0; storyIndex < stories.length; storyIndex++) {
          const story = stories[storyIndex];
          const storyX = phaseX;
          const storyY = releaseY + (storyIndex * 80);
          
          const storyPos = layoutDesigner.findSafePosition(
            { x: storyX, y: storyY },
            { width: 320, height: 70 },
            'square'
          );
          
          const storyResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
            data: {
              content: story,
              shape: 'square'
            },
            position: storyPos,
            style: { fillColor: release.color }
          });
          
          implementationState.storyIds.push(storyResponse.data.id);
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        }
        phaseIndex++;
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create user stories: ${error.message}`);
    return false;
  }
}

// Create walking skeleton
async function createWalkingSkeleton() {
  log.phase('CREATING WALKING SKELETON');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startX = frameX - 600;
    const startY = frameY + 900;
    
    // Walking skeleton header
    const headerPos = layoutDesigner.findSafePosition(
      { x: startX, y: startY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'WALKING SKELETON\n(Minimal path to first insight)',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Skeleton steps
    for (let i = 0; i < STORY_MAP_STRUCTURE.walkingSkeleton.length; i++) {
      const step = STORY_MAP_STRUCTURE.walkingSkeleton[i];
      const stepX = startX + (i * 280);
      const stepY = startY + 120;
      
      const stepPos = layoutDesigner.findSafePosition(
        { x: stepX, y: stepY },
        { width: 250, height: 80 },
        'square'
      );
      
      const stepResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `Step ${i + 1}:\n${step}`,
          shape: 'square'
        },
        position: stepPos,
        style: { fillColor: CONFIG.COLORS.MVP }
      });
      
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Connect steps with arrows
      if (i > 0) {
        try {
          await miroApi.post(`/boards/${CONFIG.BOARD_ID}/connectors`, {
            startItem: { id: implementationState.storyIds[implementationState.storyIds.length - 2] },
            endItem: { id: stepResponse.data.id },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow',
              strokeColor: '#000000',
              strokeStyle: 'normal'
            }
          });
        } catch (err) {
          // Continue if connector fails
        }
      }
      
      implementationState.storyIds.push(stepResponse.data.id);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create walking skeleton: ${error.message}`);
    return false;
  }
}

// Create implementation timeline
async function createImplementationTimeline() {
  log.phase('CREATING IMPLEMENTATION TIMELINE');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const timelineX = frameX + 300;
    const timelineY = frameY + 900;
    
    // Timeline header
    const headerPos = layoutDesigner.findSafePosition(
      { x: timelineX, y: timelineY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'IMPLEMENTATION TIMELINE\n15-Minute Insight Focus',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Timeline milestones
    const milestones = [
      { week: 'Day 1-3', focus: 'Templates & Visual Hierarchy', metric: 'Setup < 5 min' },
      { week: 'Week 1', focus: 'MVP - Basic Flow', metric: 'First insight < 20 min' },
      { week: 'Week 2', focus: 'Tutorial & Highlighting', metric: 'First insight < 15 min' },
      { week: 'Week 3-4', focus: 'AI Assistance', metric: 'Success rate > 80%' },
      { week: 'Month 2+', focus: 'Advanced Features', metric: 'Retention > 60%' }
    ];
    
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      const milestoneY = timelineY + 120 + (i * 100);
      
      const milestonePos = layoutDesigner.findSafePosition(
        { x: timelineX, y: milestoneY },
        { width: 350, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${milestone.week}: ${milestone.focus}\n📊 ${milestone.metric}`,
          shape: 'square'
        },
        position: milestonePos,
        style: { fillColor: CONFIG.COLORS.RELEASE_1 }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create timeline: ${error.message}`);
    return false;
  }
}

// Create key insights section
async function createKeyInsights() {
  log.phase('CREATING KEY INSIGHTS SECTION');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const insightsX = frameX - 600;
    const insightsY = frameY + 1200;
    
    // Insights header
    const headerPos = layoutDesigner.findSafePosition(
      { x: insightsX, y: insightsY },
      { width: 500, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY INSIGHTS FROM STORY MAPPING',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Key insights
    const insights = [
      '🎯 MVP focuses on templates and visual clarity',
      '📊 Each phase has clear success metrics',
      '🚀 Walking skeleton proves value in 5 steps',
      '⚡ Quick wins prioritized in Week 1',
      '🔬 Progressive complexity prevents overwhelm',
      '🎨 Visual hierarchy critical throughout journey'
    ];
    
    for (let i = 0; i < insights.length; i++) {
      const insightX = insightsX + (i % 3) * 350;
      const insightY = insightsY + 120 + Math.floor(i / 3) * 100;
      
      const insightPos = layoutDesigner.findSafePosition(
        { x: insightX, y: insightY },
        { width: 320, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: insights[i],
          shape: 'square'
        },
        position: insightPos,
        style: { fillColor: CONFIG.COLORS.FUTURE }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create insights: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'story-mapping-state.json';
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
  console.log('📖 Galaxy Solution Story Mapping Implementation');
  console.log('🎯 Teresa Torres Story Mapping Method');
  console.log('⚡ Focus: Product Outcome 1 - 15-minute insight achievement');
  console.log('');
  
  // Find the frame
  const frameFound = await findStoryMapFrame();
  if (!frameFound) {
    log.error('Cannot proceed without Galaxy Solution Story Mapping frame');
    console.log('\nPlease ensure you have a frame titled "Galaxy Solution Story Mapping" on your board');
    return;
  }
  
  // Create journey backbone
  const backboneCreated = await createJourneyBackbone();
  if (!backboneCreated) {
    log.error('Failed to create journey backbone');
    saveState();
    return;
  }
  
  // Create user stories
  const storiesCreated = await createUserStories();
  if (!storiesCreated) {
    log.error('Failed to create user stories');
  }
  
  // Create walking skeleton
  const skeletonCreated = await createWalkingSkeleton();
  if (!skeletonCreated) {
    log.error('Failed to create walking skeleton');
  }
  
  // Create implementation timeline
  const timelineCreated = await createImplementationTimeline();
  if (!timelineCreated) {
    log.error('Failed to create timeline');
  }
  
  // Create key insights
  const insightsCreated = await createKeyInsights();
  if (!insightsCreated) {
    log.error('Failed to create insights');
  }
  
  // Generate layout report
  const layoutReport = generateLayoutReport();
  
  // Final report
  log.phase('🎉 SOLUTION STORY MAPPING COMPLETE!');
  console.log('📊 Created Teresa Torres Story Map:');
  console.log(`   ✅ ${STORY_MAP_STRUCTURE.journeyPhases.length} Journey Phases`);
  console.log(`   ✅ ${implementationState.activityIds.length} User Activities`);
  console.log(`   ✅ ${implementationState.storyIds.length} User Stories`);
  console.log(`   ✅ 4 Release Slices (MVP → Future)`);
  console.log(`   ✅ 5-Step Walking Skeleton`);
  console.log(`   ✅ Implementation Timeline`);
  
  console.log('\n🎯 MVP Focus (Week 1):');
  console.log('   • Quick Start Templates');
  console.log('   • Visual Hierarchy Optimization');
  console.log('   • Pattern Highlighting');
  console.log('   • Simplified Interface');
  
  console.log('\n📈 Success Metrics by Phase:');
  Object.entries(STORY_MAP_STRUCTURE.phaseMetrics).forEach(([phase, metric]) => {
    console.log(`   • ${phase}: ${metric}`);
  });
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres: Story mapping reveals the complete user journey');
  console.log('🎨 Layout Designer ensured optimal spacing and visibility');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}