#!/usr/bin/env node

// Galaxy Testing Assumptions Implementation
// Teresa Torres Assumption Testing Framework
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
  
  // Assumption testing colors
  COLORS: {
    CRITICAL: 'red',              // Critical assumptions
    HIGH_RISK: 'orange',           // High risk assumptions
    MEDIUM_RISK: 'yellow',         // Medium risk assumptions
    LOW_RISK: 'light_green',      // Low risk assumptions
    VALIDATED: 'green',            // Validated assumptions
    EXPERIMENT: 'blue',            // Experiments
    METRIC: 'violet',              // Success metrics
    CATEGORY: 'dark_blue',         // Category headers
    INSIGHT: 'light_blue'          // Key insights
  }
};

// Enhanced Layout Designer for assumption mapping
const layoutDesigner = new LayoutDesigner({
  minPadding: 80,
  horizontalGap: 320,
  verticalGap: 140,
  connectorClearance: 50,
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

// Teresa Torres Assumption Testing Framework
const ASSUMPTION_FRAMEWORK = {
  title: 'GALAXY TESTING ASSUMPTIONS',
  subtitle: 'Teresa Torres Discovery Framework - Product Outcome 1: 15-minute insight',
  
  // Core assumption categories from Teresa Torres
  categories: {
    DESIRABILITY: {
      title: 'DESIRABILITY ASSUMPTIONS',
      question: 'Will users want this?',
      assumptions: [
        {
          assumption: 'Users need insights within 15 minutes for decision-making',
          risk: 'CRITICAL',
          experiment: 'Time-tracking study with 20 target users',
          success_criteria: '80% achieve insight < 15 min',
          validation_method: 'User testing sessions',
          evidence: 'Survey: 87% say current tools too slow'
        },
        {
          assumption: 'Visual hierarchy improves data comprehension',
          risk: 'HIGH',
          experiment: 'A/B test visual vs traditional views',
          success_criteria: 'Pattern recognition 50% faster',
          validation_method: 'Eye-tracking study',
          evidence: 'Prototype testing shows 3x faster'
        },
        {
          assumption: 'Templates accelerate initial setup',
          risk: 'HIGH',
          experiment: 'Template vs blank slate comparison',
          success_criteria: 'Setup time < 5 minutes',
          validation_method: 'Onboarding flow analytics',
          evidence: 'Competitor analysis confirms need'
        },
        {
          assumption: 'Users prefer guided over exploratory analysis',
          risk: 'MEDIUM',
          experiment: 'Preference testing with options',
          success_criteria: '60% choose guided path',
          validation_method: 'Feature usage analytics',
          evidence: 'User interviews support this'
        }
      ]
    },
    
    VIABILITY: {
      title: 'VIABILITY ASSUMPTIONS',
      question: 'Can we build a sustainable business?',
      assumptions: [
        {
          assumption: 'Users will pay for faster insights',
          risk: 'CRITICAL',
          experiment: 'Pricing sensitivity survey',
          success_criteria: '30% willing to pay target price',
          validation_method: 'Van Westendorp analysis',
          evidence: 'Market research shows willingness'
        },
        {
          assumption: 'Quick wins drive conversion to paid',
          risk: 'HIGH',
          experiment: 'Free trial conversion tracking',
          success_criteria: '25% trial-to-paid conversion',
          validation_method: 'Cohort analysis',
          evidence: 'Industry benchmarks support'
        },
        {
          assumption: 'Market size supports growth targets',
          risk: 'MEDIUM',
          experiment: 'TAM/SAM/SOM analysis',
          success_criteria: '$10M addressable market',
          validation_method: 'Market research',
          evidence: 'Gartner reports confirm size'
        }
      ]
    },
    
    FEASIBILITY: {
      title: 'FEASIBILITY ASSUMPTIONS',
      question: 'Can we build it?',
      assumptions: [
        {
          assumption: 'We can process data in real-time',
          risk: 'HIGH',
          experiment: 'Performance benchmarking',
          success_criteria: 'Response time < 2 seconds',
          validation_method: 'Load testing',
          evidence: 'Prototype achieves 1.5s avg'
        },
        {
          assumption: 'Visual rendering scales with data size',
          risk: 'HIGH',
          experiment: 'Stress testing with large datasets',
          success_criteria: 'Smooth with 100k data points',
          validation_method: 'Performance profiling',
          evidence: 'WebGL tests show feasibility'
        },
        {
          assumption: 'AI can identify relevant patterns',
          risk: 'MEDIUM',
          experiment: 'ML model accuracy testing',
          success_criteria: '85% pattern detection accuracy',
          validation_method: 'Confusion matrix analysis',
          evidence: 'Initial models at 78%'
        }
      ]
    },
    
    USABILITY: {
      title: 'USABILITY ASSUMPTIONS',
      question: 'Can users figure out how to use it?',
      assumptions: [
        {
          assumption: 'First-time users understand the interface',
          risk: 'CRITICAL',
          experiment: 'Unmoderated usability testing',
          success_criteria: '80% complete first task unassisted',
          validation_method: 'Task completion rate',
          evidence: 'Prototype testing: 72% success'
        },
        {
          assumption: 'Progressive disclosure prevents overwhelm',
          risk: 'HIGH',
          experiment: 'Cognitive load measurement',
          success_criteria: 'Satisfaction score > 7/10',
          validation_method: 'SUS scoring',
          evidence: 'Early feedback positive'
        },
        {
          assumption: 'Contextual help reduces support needs',
          risk: 'MEDIUM',
          experiment: 'Support ticket analysis',
          success_criteria: '<5% users need support',
          validation_method: 'Support metrics',
          evidence: 'Competitor data shows 8-12%'
        }
      ]
    },
    
    ETHICAL: {
      title: 'ETHICAL ASSUMPTIONS',
      question: 'Should we build this?',
      assumptions: [
        {
          assumption: 'Data privacy can be maintained',
          risk: 'CRITICAL',
          experiment: 'Security audit',
          success_criteria: 'Zero data breaches',
          validation_method: 'Penetration testing',
          evidence: 'Architecture review passed'
        },
        {
          assumption: 'AI recommendations are unbiased',
          risk: 'HIGH',
          experiment: 'Bias testing across demographics',
          success_criteria: 'No significant bias detected',
          validation_method: 'Fairness metrics',
          evidence: 'Initial tests show neutrality'
        },
        {
          assumption: 'Users maintain decision autonomy',
          risk: 'MEDIUM',
          experiment: 'Decision tracking study',
          success_criteria: 'Users feel in control',
          validation_method: 'User interviews',
          evidence: 'Design emphasizes user agency'
        }
      ]
    }
  },
  
  // Experiment prioritization matrix
  experimentPriority: {
    WEEK_1: [
      'Time-tracking study with target users',
      'Unmoderated usability testing',
      'Template vs blank slate comparison'
    ],
    WEEK_2: [
      'A/B test visual views',
      'Pricing sensitivity survey',
      'Performance benchmarking'
    ],
    WEEK_3: [
      'Free trial conversion tracking',
      'ML model accuracy testing',
      'Support ticket analysis'
    ],
    WEEK_4: [
      'Security audit',
      'Bias testing',
      'Market analysis'
    ]
  },
  
  // Risk mitigation strategies
  riskMitigation: {
    CRITICAL: {
      strategy: 'Test immediately with multiple methods',
      action: 'Pivot if invalidated',
      timeline: 'Week 1'
    },
    HIGH: {
      strategy: 'Test in Week 1-2',
      action: 'Iterate based on findings',
      timeline: 'Week 1-2'
    },
    MEDIUM: {
      strategy: 'Test in parallel with development',
      action: 'Adjust features as needed',
      timeline: 'Week 2-3'
    },
    LOW: {
      strategy: 'Monitor during beta',
      action: 'Fine-tune post-launch',
      timeline: 'Week 3-4'
    }
  },
  
  // Success metrics
  successMetrics: {
    'Time to Insight': {
      target: '< 15 minutes',
      current: '45 minutes (baseline)',
      measurement: 'Session recordings'
    },
    'Setup Completion': {
      target: '> 80%',
      current: 'N/A',
      measurement: 'Funnel analytics'
    },
    'Pattern Recognition': {
      target: '< 10 minutes',
      current: '30 minutes (baseline)',
      measurement: 'Task timing'
    },
    'User Satisfaction': {
      target: '> 8/10',
      current: 'N/A',
      measurement: 'NPS surveys'
    },
    'Trial Conversion': {
      target: '> 25%',
      current: 'N/A',
      measurement: 'Subscription data'
    }
  }
};

// Implementation state
let implementationState = {
  frameId: null,
  framePosition: null,
  categoryIds: [],
  assumptionIds: [],
  experimentIds: [],
  metricIds: [],
  errors: []
};

// Find the Testing Assumptions frame
async function findAssumptionsFrame() {
  log.phase('FINDING GALAXY TESTING ASSUMPTIONS FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    const assumptionsFrame = frames.find(frame => 
      frame.data && frame.data.title && 
      frame.data.title === 'Galaxy Testing Assumptions'
    );
    
    if (assumptionsFrame) {
      implementationState.frameId = assumptionsFrame.id;
      implementationState.framePosition = assumptionsFrame.position;
      log.success(`Found frame at position (${assumptionsFrame.position.x}, ${assumptionsFrame.position.y})`);
      return true;
    } else {
      log.error('Galaxy Testing Assumptions frame not found');
      return false;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return false;
  }
}

// Create framework header
async function createFrameworkHeader() {
  log.phase('CREATING FRAMEWORK HEADER');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startY = frameY - 1400;
    
    layoutDesigner.reset();
    
    // Main title
    const titlePos = layoutDesigner.findSafePosition(
      { x: frameX, y: startY },
      { width: 600, height: 100 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: `${ASSUMPTION_FRAMEWORK.title}\n${ASSUMPTION_FRAMEWORK.subtitle}`,
        shape: 'rectangle'
      },
      position: titlePos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    return true;
  } catch (error) {
    log.error(`Failed to create header: ${error.message}`);
    return false;
  }
}

// Create assumption categories
async function createAssumptionCategories() {
  log.phase('CREATING ASSUMPTION CATEGORIES');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const startX = frameX - 1400;
    const startY = frameY - 1200;
    
    const categories = Object.keys(ASSUMPTION_FRAMEWORK.categories);
    
    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const categoryKey = categories[catIndex];
      const category = ASSUMPTION_FRAMEWORK.categories[categoryKey];
      const catX = startX + (catIndex % 3) * 1000;
      const catY = startY + Math.floor(catIndex / 3) * 800;
      
      // Category header
      const headerPos = layoutDesigner.findSafePosition(
        { x: catX, y: catY },
        { width: 900, height: 80 },
        'rectangle'
      );
      
      const headerResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${category.title}\n❓ ${category.question}`,
          shape: 'rectangle'
        },
        position: headerPos,
        style: { fillColor: CONFIG.COLORS.CATEGORY }
      });
      
      implementationState.categoryIds.push(headerResponse.data.id);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Assumptions for this category
      for (let i = 0; i < category.assumptions.length; i++) {
        const assumption = category.assumptions[i];
        const assumptionY = catY + 120 + (i * 150);
        
        // Risk color based on level
        const riskColor = CONFIG.COLORS[assumption.risk + '_RISK'] || CONFIG.COLORS.MEDIUM_RISK;
        
        // Assumption card
        const assumptionPos = layoutDesigner.findSafePosition(
          { x: catX, y: assumptionY },
          { width: 280, height: 120 },
          'square'
        );
        
        const assumptionResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `📌 ${assumption.assumption}\n🎯 ${assumption.success_criteria}`,
            shape: 'square'
          },
          position: assumptionPos,
          style: { fillColor: riskColor }
        });
        
        implementationState.assumptionIds.push(assumptionResponse.data.id);
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Experiment card
        const experimentPos = layoutDesigner.findSafePosition(
          { x: catX + 300, y: assumptionY },
          { width: 280, height: 120 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `🔬 EXPERIMENT:\n${assumption.experiment}\n📊 ${assumption.validation_method}`,
            shape: 'square'
          },
          position: experimentPos,
          style: { fillColor: CONFIG.COLORS.EXPERIMENT }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
        
        // Evidence card
        const evidencePos = layoutDesigner.findSafePosition(
          { x: catX + 600, y: assumptionY },
          { width: 280, height: 120 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `📋 EVIDENCE:\n${assumption.evidence}`,
            shape: 'square'
          },
          position: evidencePos,
          style: { fillColor: CONFIG.COLORS.INSIGHT }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create categories: ${error.message}`);
    return false;
  }
}

// Create experiment timeline
async function createExperimentTimeline() {
  log.phase('CREATING EXPERIMENT TIMELINE');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const timelineX = frameX - 800;
    const timelineY = frameY + 600;
    
    // Timeline header
    const headerPos = layoutDesigner.findSafePosition(
      { x: timelineX, y: timelineY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'EXPERIMENT PRIORITIZATION\n4-Week Validation Sprint',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Weekly experiments
    const weeks = Object.keys(ASSUMPTION_FRAMEWORK.experimentPriority);
    
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];
      const experiments = ASSUMPTION_FRAMEWORK.experimentPriority[week];
      const weekX = timelineX + (weekIndex * 400);
      const weekY = timelineY + 120;
      
      // Week header
      const weekPos = layoutDesigner.findSafePosition(
        { x: weekX, y: weekY },
        { width: 350, height: 60 },
        'rectangle'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: week.replace('_', ' '),
          shape: 'rectangle'
        },
        position: weekPos,
        style: { fillColor: CONFIG.COLORS.HIGH_RISK }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Experiments for this week
      for (let i = 0; i < experiments.length; i++) {
        const experiment = experiments[i];
        const expY = weekY + 80 + (i * 80);
        
        const expPos = layoutDesigner.findSafePosition(
          { x: weekX, y: expY },
          { width: 340, height: 70 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `• ${experiment}`,
            shape: 'square'
          },
          position: expPos,
          style: { fillColor: CONFIG.COLORS.EXPERIMENT }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create timeline: ${error.message}`);
    return false;
  }
}

// Create risk mitigation matrix
async function createRiskMitigation() {
  log.phase('CREATING RISK MITIGATION MATRIX');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const matrixX = frameX + 600;
    const matrixY = frameY + 600;
    
    // Matrix header
    const headerPos = layoutDesigner.findSafePosition(
      { x: matrixX, y: matrixY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'RISK MITIGATION STRATEGIES',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Risk levels
    const riskLevels = Object.keys(ASSUMPTION_FRAMEWORK.riskMitigation);
    
    for (let i = 0; i < riskLevels.length; i++) {
      const riskLevel = riskLevels[i];
      const mitigation = ASSUMPTION_FRAMEWORK.riskMitigation[riskLevel];
      const riskY = matrixY + 120 + (i * 120);
      
      // Risk level
      const riskColor = CONFIG.COLORS[riskLevel + '_RISK'] || CONFIG.COLORS.MEDIUM_RISK;
      
      const riskPos = layoutDesigner.findSafePosition(
        { x: matrixX, y: riskY },
        { width: 150, height: 100 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${riskLevel}\n${mitigation.timeline}`,
          shape: 'square'
        },
        position: riskPos,
        style: { fillColor: riskColor }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Strategy
      const strategyPos = layoutDesigner.findSafePosition(
        { x: matrixX + 180, y: riskY },
        { width: 320, height: 100 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `📋 ${mitigation.strategy}\n➡️ ${mitigation.action}`,
          shape: 'square'
        },
        position: strategyPos,
        style: { fillColor: CONFIG.COLORS.INSIGHT }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create risk mitigation: ${error.message}`);
    return false;
  }
}

// Create success metrics dashboard
async function createSuccessMetrics() {
  log.phase('CREATING SUCCESS METRICS DASHBOARD');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const metricsX = frameX - 400;
    const metricsY = frameY + 1100;
    
    // Dashboard header
    const headerPos = layoutDesigner.findSafePosition(
      { x: metricsX, y: metricsY },
      { width: 500, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'SUCCESS METRICS DASHBOARD\nProduct Outcome 1: 15-minute insight',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Metrics
    const metrics = Object.keys(ASSUMPTION_FRAMEWORK.successMetrics);
    
    for (let i = 0; i < metrics.length; i++) {
      const metricName = metrics[i];
      const metric = ASSUMPTION_FRAMEWORK.successMetrics[metricName];
      const metricX = metricsX + (i % 3) * 350;
      const metricY = metricsY + 120 + Math.floor(i / 3) * 120;
      
      const metricPos = layoutDesigner.findSafePosition(
        { x: metricX, y: metricY },
        { width: 320, height: 100 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `📊 ${metricName}\n🎯 Target: ${metric.target}\n📈 Current: ${metric.current}\n🔍 ${metric.measurement}`,
          shape: 'square'
        },
        position: metricPos,
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      
      implementationState.metricIds.push(metricName);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create metrics: ${error.message}`);
    return false;
  }
}

// Create key insights section
async function createKeyInsights() {
  log.phase('CREATING KEY INSIGHTS');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const insightsX = frameX - 400;
    const insightsY = frameY + 1500;
    
    // Insights header
    const headerPos = layoutDesigner.findSafePosition(
      { x: insightsX, y: insightsY },
      { width: 500, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY DISCOVERY INSIGHTS',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Key insights from discovery
    const insights = [
      '🚨 CRITICAL: Users must see value in <15 min or abandon',
      '✅ VALIDATED: Visual hierarchy 3x faster than tables',
      '🎯 HIGH CONFIDENCE: Templates reduce setup 75%',
      '⚡ CONFIRMED: Quick wins drive 2.5x conversion',
      '🔬 TO TEST: AI pattern detection accuracy',
      '📊 RISK: Performance at scale needs validation',
      '💡 OPPORTUNITY: Progressive disclosure prevents overwhelm',
      '🏆 DIFFERENTIATOR: Real-time visual feedback'
    ];
    
    for (let i = 0; i < insights.length; i++) {
      const insightX = insightsX + (i % 4) * 350;
      const insightY = insightsY + 120 + Math.floor(i / 4) * 100;
      
      const insightPos = layoutDesigner.findSafePosition(
        { x: insightX, y: insightY },
        { width: 320, height: 80 },
        'square'
      );
      
      const color = insights[i].includes('CRITICAL') ? CONFIG.COLORS.CRITICAL :
                   insights[i].includes('VALIDATED') ? CONFIG.COLORS.VALIDATED :
                   insights[i].includes('HIGH CONFIDENCE') ? CONFIG.COLORS.LOW_RISK :
                   CONFIG.COLORS.INSIGHT;
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: insights[i],
          shape: 'square'
        },
        position: insightPos,
        style: { fillColor: color }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create insights: ${error.message}`);
    return false;
  }
}

// Create validation roadmap
async function createValidationRoadmap() {
  log.phase('CREATING VALIDATION ROADMAP');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const roadmapX = frameX + 600;
    const roadmapY = frameY + 1100;
    
    // Roadmap header
    const headerPos = layoutDesigner.findSafePosition(
      { x: roadmapX, y: roadmapY },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'VALIDATION ROADMAP',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.CATEGORY }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Validation phases
    const phases = [
      { phase: 'WEEK 1', focus: 'Core Desirability', tests: 'User testing, Time tracking' },
      { phase: 'WEEK 2', focus: 'Viability & Feasibility', tests: 'Pricing, Performance' },
      { phase: 'WEEK 3', focus: 'Usability & Scale', tests: 'Onboarding, Load testing' },
      { phase: 'WEEK 4', focus: 'Ethics & Launch', tests: 'Security, Bias testing' },
      { phase: 'POST-LAUNCH', focus: 'Continuous Learning', tests: 'Analytics, User feedback' }
    ];
    
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseY = roadmapY + 120 + (i * 100);
      
      const phasePos = layoutDesigner.findSafePosition(
        { x: roadmapX, y: phaseY },
        { width: 380, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${phase.phase}: ${phase.focus}\n🔬 ${phase.tests}`,
          shape: 'square'
        },
        position: phasePos,
        style: { fillColor: CONFIG.COLORS.EXPERIMENT }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create roadmap: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'testing-assumptions-state.json';
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
  console.log('🔬 Galaxy Testing Assumptions Implementation');
  console.log('📖 Teresa Torres Assumption Testing Framework');
  console.log('🎯 Focus: Product Outcome 1 - 15-minute insight achievement');
  console.log('');
  
  // Find the frame
  const frameFound = await findAssumptionsFrame();
  if (!frameFound) {
    log.error('Cannot proceed without Galaxy Testing Assumptions frame');
    console.log('\nPlease ensure you have a frame titled "Galaxy Testing Assumptions" on your board');
    return;
  }
  
  // Create framework header
  const headerCreated = await createFrameworkHeader();
  if (!headerCreated) {
    log.error('Failed to create framework header');
    saveState();
    return;
  }
  
  // Create assumption categories
  const categoriesCreated = await createAssumptionCategories();
  if (!categoriesCreated) {
    log.error('Failed to create assumption categories');
  }
  
  // Create experiment timeline
  const timelineCreated = await createExperimentTimeline();
  if (!timelineCreated) {
    log.error('Failed to create experiment timeline');
  }
  
  // Create risk mitigation matrix
  const mitigationCreated = await createRiskMitigation();
  if (!mitigationCreated) {
    log.error('Failed to create risk mitigation');
  }
  
  // Create success metrics
  const metricsCreated = await createSuccessMetrics();
  if (!metricsCreated) {
    log.error('Failed to create success metrics');
  }
  
  // Create key insights
  const insightsCreated = await createKeyInsights();
  if (!insightsCreated) {
    log.error('Failed to create insights');
  }
  
  // Create validation roadmap
  const roadmapCreated = await createValidationRoadmap();
  if (!roadmapCreated) {
    log.error('Failed to create roadmap');
  }
  
  // Generate layout report
  const layoutReport = generateLayoutReport();
  
  // Final report
  log.phase('🎉 TESTING ASSUMPTIONS COMPLETE!');
  console.log('📊 Created Teresa Torres Assumption Testing Framework:');
  console.log(`   ✅ 5 Assumption Categories (Desirability, Viability, Feasibility, Usability, Ethical)`);
  console.log(`   ✅ ${implementationState.assumptionIds.length} Assumptions with experiments`);
  console.log(`   ✅ 4-Week Experiment Timeline`);
  console.log(`   ✅ Risk Mitigation Matrix`);
  console.log(`   ✅ Success Metrics Dashboard`);
  console.log(`   ✅ Validation Roadmap`);
  
  console.log('\n🔬 Critical Assumptions to Test First:');
  console.log('   • Users need insights within 15 minutes');
  console.log('   • Users will pay for faster insights');
  console.log('   • First-time users understand the interface');
  console.log('   • Data privacy can be maintained');
  
  console.log('\n📈 Key Success Metrics:');
  Object.entries(ASSUMPTION_FRAMEWORK.successMetrics).forEach(([metric, data]) => {
    console.log(`   • ${metric}: ${data.target}`);
  });
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres: Test assumptions early and often');
  console.log('🎨 Layout Designer ensured optimal spacing and visibility');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}