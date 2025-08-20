#!/usr/bin/env node

// Galaxy Assess & Prioritize Implementation
// Teresa Torres Assessment and Prioritization Framework
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
  
  // Teresa Torres prioritization colors
  COLORS: {
    HIGH_PRIORITY: 'red',          // High priority/risk items
    MEDIUM_PRIORITY: 'orange',     // Medium priority items
    LOW_PRIORITY: 'light_green',   // Low priority items
    ASSUMPTION: 'violet',          // Assumptions to test
    EVIDENCE: 'light_blue',        // Evidence/data
    METRIC: 'yellow',              // Success metrics
    LABEL: 'gray',                 // Labels and headers
    OUTCOME: 'blue'                // Product outcome reference
  }
};

// Enhanced Layout Designer for assessment matrices
const layoutDesigner = new LayoutDesigner({
  minPadding: 100,          // Extra padding for matrices
  horizontalGap: 400,        // Wide spacing for readability
  verticalGap: 350,          // Vertical spacing
  connectorClearance: 60,    // Space for connectors
  useGrid: true,
  gridCellWidth: 450,
  gridCellHeight: 450
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

// Assessment and Prioritization Structure
const ASSESSMENT_STRUCTURE = {
  productOutcome: {
    title: 'PRODUCT OUTCOME 1 (Focus)',
    content: 'Users achieve first meaningful insight within 15 minutes'
  },
  
  // Solutions from OST2 with assessment data
  solutions: [
    // Opportunity 1: Complete tutorial < 10 min
    {
      id: 'S1.1',
      title: 'Guided Interactive Tutorial',
      opportunity: 'Complete simplified tutorial',
      impact: 'HIGH',
      effort: 'MEDIUM',
      confidence: 'HIGH',
      timeToValue: '1 week',
      assumptions: [
        'Users can learn 3D navigation with guidance',
        'Tutorial completion correlates with retention'
      ],
      evidence: {
        strength: 'MODERATE',
        data: 'Mitch: "Makes sense when playing with you"'
      },
      successMetrics: [
        'Completion rate > 80%',
        'Time to complete < 10 min'
      ]
    },
    {
      id: 'S1.2',
      title: 'Quick Start Templates',
      opportunity: 'Complete simplified tutorial',
      impact: 'HIGH',
      effort: 'LOW',
      confidence: 'HIGH',
      timeToValue: '3 days',
      assumptions: [
        'Templates accelerate value discovery',
        'Users prefer starting with examples'
      ],
      evidence: {
        strength: 'STRONG',
        data: 'Industry best practice, common request'
      },
      successMetrics: [
        'Template usage > 60%',
        '3x faster first insight'
      ]
    },
    {
      id: 'S1.3',
      title: 'Progressive Complexity',
      opportunity: 'Complete simplified tutorial',
      impact: 'MEDIUM',
      effort: 'HIGH',
      confidence: 'MEDIUM',
      timeToValue: '2 weeks',
      assumptions: [
        'Gradual complexity improves adoption',
        'Users will unlock advanced features'
      ],
      evidence: {
        strength: 'WEAK',
        data: 'Hypothesis based on cognitive load theory'
      },
      successMetrics: [
        'Feature adoption curve',
        'Reduced abandonment'
      ]
    },
    
    // Opportunity 2: Map 2-3 attributes
    {
      id: 'S2.1',
      title: 'Attribute Recommendation Engine',
      opportunity: 'Map key attributes to data',
      impact: 'HIGH',
      effort: 'HIGH',
      confidence: 'MEDIUM',
      timeToValue: '3 weeks',
      assumptions: [
        'AI can predict best attributes',
        'Users trust AI recommendations'
      ],
      evidence: {
        strength: 'WEAK',
        data: 'Samuel: "We expect to write a question"'
      },
      successMetrics: [
        'Recommendation acceptance > 70%',
        'Correct mapping > 80%'
      ]
    },
    {
      id: 'S2.2',
      title: 'Visual Attribute Wizard',
      opportunity: 'Map key attributes to data',
      impact: 'MEDIUM',
      effort: 'MEDIUM',
      confidence: 'HIGH',
      timeToValue: '1 week',
      assumptions: [
        'Decision tree helps selection',
        'Preview improves confidence'
      ],
      evidence: {
        strength: 'STRONG',
        data: 'Mitch: "Don\'t know the difference"'
      },
      successMetrics: [
        'Wizard completion > 90%',
        'Mapping accuracy > 85%'
      ]
    },
    {
      id: 'S2.3',
      title: 'Calculated Fields Builder',
      opportunity: 'Map key attributes to data',
      impact: 'MEDIUM',
      effort: 'HIGH',
      confidence: 'LOW',
      timeToValue: '4 weeks',
      assumptions: [
        'Users need derived metrics',
        'Can create formulas easily'
      ],
      evidence: {
        strength: 'MODERATE',
        data: 'Mitch: "Create aggregate of two stats"'
      },
      successMetrics: [
        'Custom metric creation > 30%',
        'Reuse rate > 50%'
      ]
    },
    
    // Opportunity 3: Identify patterns
    {
      id: 'S3.1',
      title: 'Smart Highlighting System',
      opportunity: 'Identify actionable patterns',
      impact: 'HIGH',
      effort: 'MEDIUM',
      confidence: 'HIGH',
      timeToValue: '1 week',
      assumptions: [
        'Auto-highlighting improves discovery',
        'Visual emphasis aids pattern recognition'
      ],
      evidence: {
        strength: 'STRONG',
        data: 'Visual hierarchy proven in UX research'
      },
      successMetrics: [
        '2x faster anomaly detection',
        'Pattern identification > 90%'
      ]
    },
    {
      id: 'S3.2',
      title: 'Insight Discovery Assistant',
      opportunity: 'Identify actionable patterns',
      impact: 'HIGH',
      effort: 'HIGH',
      confidence: 'LOW',
      timeToValue: '6 weeks',
      assumptions: [
        'AI can identify meaningful patterns',
        'Users trust AI insights'
      ],
      evidence: {
        strength: 'WEAK',
        data: 'No direct evidence yet'
      },
      successMetrics: [
        'Insight relevance > 75%',
        'User validation > 80%'
      ]
    },
    {
      id: 'S3.3',
      title: 'Visual Hierarchy Optimization',
      opportunity: 'Identify actionable patterns',
      impact: 'MEDIUM',
      effort: 'LOW',
      confidence: 'HIGH',
      timeToValue: '3 days',
      assumptions: [
        'Better hierarchy improves focus',
        'Reduces cognitive overload'
      ],
      evidence: {
        strength: 'STRONG',
        data: 'Mitch: "Too many factors"'
      },
      successMetrics: [
        'Reduced confusion score',
        'Faster pattern recognition'
      ]
    }
  ],
  
  // Assumption test framework (Teresa Torres)
  assumptionTests: [
    {
      assumption: 'Users can learn 3D navigation',
      test: 'Tutorial Completion Study',
      method: 'Usability testing with 10 users',
      successCriteria: '80% complete tutorial',
      timeline: 'Week 1',
      priority: 'HIGH'
    },
    {
      assumption: 'Templates accelerate value',
      test: 'Template vs Blank Start',
      method: 'A/B test with new users',
      successCriteria: '3x faster insight with templates',
      timeline: 'Week 1',
      priority: 'HIGH'
    },
    {
      assumption: 'AI recommendations trusted',
      test: 'Recommendation Acceptance',
      method: 'Track acceptance rate',
      successCriteria: '70% accept recommendations',
      timeline: 'Week 2',
      priority: 'MEDIUM'
    },
    {
      assumption: 'Visual hierarchy aids discovery',
      test: 'Pattern Recognition Speed',
      method: 'With/without highlighting comparison',
      successCriteria: '2x faster with highlighting',
      timeline: 'Week 1',
      priority: 'HIGH'
    }
  ]
};

// Implementation state
let implementationState = {
  frameId: null,
  framePosition: null,
  matrixIds: [],
  solutionIds: [],
  assumptionIds: [],
  metricIds: [],
  connectorIds: [],
  errors: []
};

// Find the Galaxy Assess & Prioritize frame
async function findAssessFrame() {
  log.phase('FINDING GALAXY ASSESS & PRIORITIZE FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    const assessFrame = frames.find(frame => 
      frame.data && frame.data.title && 
      frame.data.title.toLowerCase().includes('assess') && 
      frame.data.title.toLowerCase().includes('prioritize')
    );
    
    if (assessFrame) {
      implementationState.frameId = assessFrame.id;
      implementationState.framePosition = assessFrame.position;
      log.success(`Found frame at position (${assessFrame.position.x}, ${assessFrame.position.y})`);
      return true;
    } else {
      log.error('Galaxy Assess & Prioritize frame not found');
      return false;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return false;
  }
}

// Create the Impact vs Effort matrix
async function createImpactEffortMatrix() {
  log.phase('CREATING IMPACT VS EFFORT MATRIX');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const matrixStartX = frameX - 800;
    const matrixStartY = frameY - 400;
    
    layoutDesigner.reset();
    
    // Create matrix title
    const titlePos = layoutDesigner.findSafePosition(
      { x: matrixStartX + 400, y: matrixStartY - 150 },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'IMPACT vs EFFORT MATRIX\n(Teresa Torres Prioritization)',
        shape: 'rectangle'
      },
      position: titlePos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create quadrant labels
    const quadrants = [
      { label: 'QUICK WINS\n(High Impact, Low Effort)', x: matrixStartX, y: matrixStartY, color: CONFIG.COLORS.HIGH_PRIORITY },
      { label: 'MAJOR PROJECTS\n(High Impact, High Effort)', x: matrixStartX + 600, y: matrixStartY, color: CONFIG.COLORS.MEDIUM_PRIORITY },
      { label: 'FILL-INS\n(Low Impact, Low Effort)', x: matrixStartX, y: matrixStartY + 400, color: CONFIG.COLORS.LOW_PRIORITY },
      { label: 'QUESTIONABLE\n(Low Impact, High Effort)', x: matrixStartX + 600, y: matrixStartY + 400, color: CONFIG.COLORS.LABEL }
    ];
    
    for (const quadrant of quadrants) {
      const quadPos = layoutDesigner.findSafePosition(
        { x: quadrant.x, y: quadrant.y },
        { width: 200, height: 100 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: quadrant.label,
          shape: 'square'
        },
        position: quadPos,
        style: { fillColor: quadrant.color }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    // Place solutions in matrix based on impact/effort
    for (const solution of ASSESSMENT_STRUCTURE.solutions) {
      // Calculate position based on impact/effort
      let x = matrixStartX;
      let y = matrixStartY;
      
      if (solution.effort === 'HIGH') x += 600;
      else if (solution.effort === 'MEDIUM') x += 300;
      
      if (solution.impact === 'LOW') y += 400;
      else if (solution.impact === 'MEDIUM') y += 200;
      
      // Determine color based on priority
      let color = CONFIG.COLORS.LOW_PRIORITY;
      if (solution.impact === 'HIGH' && solution.effort === 'LOW') {
        color = CONFIG.COLORS.HIGH_PRIORITY;
      } else if (solution.impact === 'HIGH') {
        color = CONFIG.COLORS.MEDIUM_PRIORITY;
      }
      
      const solPos = layoutDesigner.findSafePosition(
        { x: x + Math.random() * 150, y: y + 100 + Math.random() * 100 },
        { width: 180, height: 120 },
        'square'
      );
      
      const solResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${solution.id}: ${solution.title}\n\nConfidence: ${solution.confidence}\nTime: ${solution.timeToValue}`,
          shape: 'square'
        },
        position: solPos,
        style: { fillColor: color }
      });
      
      implementationState.solutionIds.push(solResponse.data.id);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create matrix: ${error.message}`);
    return false;
  }
}

// Create assumption testing board
async function createAssumptionTestingBoard() {
  log.phase('CREATING ASSUMPTION TESTING BOARD');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const testingStartX = frameX + 200;
    const testingStartY = frameY - 400;
    
    // Title
    const titlePos = layoutDesigner.findSafePosition(
      { x: testingStartX + 300, y: testingStartY - 150 },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'ASSUMPTION TESTS\n(Riskiest Assumptions First)',
        shape: 'rectangle'
      },
      position: titlePos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Create test cards
    for (let i = 0; i < ASSESSMENT_STRUCTURE.assumptionTests.length; i++) {
      const test = ASSESSMENT_STRUCTURE.assumptionTests[i];
      const testX = testingStartX + (i % 2) * 400;
      const testY = testingStartY + Math.floor(i / 2) * 250;
      
      // Determine color by priority
      let color = CONFIG.COLORS.LOW_PRIORITY;
      if (test.priority === 'HIGH') color = CONFIG.COLORS.HIGH_PRIORITY;
      else if (test.priority === 'MEDIUM') color = CONFIG.COLORS.MEDIUM_PRIORITY;
      
      const testPos = layoutDesigner.findSafePosition(
        { x: testX, y: testY },
        { width: 350, height: 200 },
        'square'
      );
      
      const testResponse = await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `ASSUMPTION: ${test.assumption}\n\nTEST: ${test.test}\nMETHOD: ${test.method}\nSUCCESS: ${test.successCriteria}\nTIMELINE: ${test.timeline}`,
          shape: 'square'
        },
        position: testPos,
        style: { fillColor: CONFIG.COLORS.ASSUMPTION }
      });
      
      implementationState.assumptionIds.push(testResponse.data.id);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Add priority label
      const priorityPos = layoutDesigner.findSafePosition(
        { x: testPos.x + 380, y: testPos.y },
        { width: 100, height: 50 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: test.priority,
          shape: 'square'
        },
        position: priorityPos,
        style: { fillColor: color }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create testing board: ${error.message}`);
    return false;
  }
}

// Create evidence strength assessment
async function createEvidenceAssessment() {
  log.phase('CREATING EVIDENCE STRENGTH ASSESSMENT');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const evidenceStartX = frameX - 800;
    const evidenceStartY = frameY + 500;
    
    // Title
    const titlePos = layoutDesigner.findSafePosition(
      { x: evidenceStartX + 400, y: evidenceStartY - 100 },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'EVIDENCE STRENGTH ASSESSMENT',
        shape: 'rectangle'
      },
      position: titlePos,
      style: { fillColor: CONFIG.COLORS.LABEL }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Group solutions by evidence strength
    const evidenceGroups = {
      STRONG: [],
      MODERATE: [],
      WEAK: []
    };
    
    for (const solution of ASSESSMENT_STRUCTURE.solutions) {
      evidenceGroups[solution.evidence.strength].push(solution);
    }
    
    // Create columns for each strength level
    const strengthLevels = ['STRONG', 'MODERATE', 'WEAK'];
    const colors = {
      STRONG: CONFIG.COLORS.HIGH_PRIORITY,
      MODERATE: CONFIG.COLORS.MEDIUM_PRIORITY,
      WEAK: CONFIG.COLORS.LOW_PRIORITY
    };
    
    for (let i = 0; i < strengthLevels.length; i++) {
      const strength = strengthLevels[i];
      const columnX = evidenceStartX + i * 400;
      
      // Column header
      const headerPos = layoutDesigner.findSafePosition(
        { x: columnX, y: evidenceStartY },
        { width: 150, height: 60 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${strength}\nEVIDENCE`,
          shape: 'square'
        },
        position: headerPos,
        style: { fillColor: colors[strength] }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Solutions in this column
      for (let j = 0; j < evidenceGroups[strength].length; j++) {
        const solution = evidenceGroups[strength][j];
        const solY = evidenceStartY + 100 + j * 120;
        
        const solPos = layoutDesigner.findSafePosition(
          { x: columnX, y: solY },
          { width: 300, height: 100 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: `${solution.id}: ${solution.title}\n\n"${solution.evidence.data}"`,
            shape: 'square'
          },
          position: solPos,
          style: { fillColor: CONFIG.COLORS.EVIDENCE }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create evidence assessment: ${error.message}`);
    return false;
  }
}

// Create implementation roadmap
async function createImplementationRoadmap() {
  log.phase('CREATING IMPLEMENTATION ROADMAP');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const roadmapStartX = frameX + 200;
    const roadmapStartY = frameY + 500;
    
    // Title
    const titlePos = layoutDesigner.findSafePosition(
      { x: roadmapStartX + 300, y: roadmapStartY - 100 },
      { width: 400, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'IMPLEMENTATION ROADMAP\n(15-Minute Insight Focus)',
        shape: 'rectangle'
      },
      position: titlePos,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Week-by-week implementation plan
    const weeks = [
      {
        week: 'WEEK 1',
        solutions: ['S1.2: Quick Start Templates', 'S3.3: Visual Hierarchy'],
        focus: 'Quick wins for immediate impact'
      },
      {
        week: 'WEEK 2',
        solutions: ['S1.1: Guided Tutorial', 'S3.1: Smart Highlighting'],
        focus: 'Core onboarding improvements'
      },
      {
        week: 'WEEK 3-4',
        solutions: ['S2.2: Attribute Wizard', 'S2.1: Recommendation Engine'],
        focus: 'Attribute mapping assistance'
      },
      {
        week: 'WEEK 5+',
        solutions: ['S1.3: Progressive Complexity', 'S3.2: AI Discovery'],
        focus: 'Advanced features'
      }
    ];
    
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      const weekX = roadmapStartX + i * 350;
      
      // Week header
      const weekPos = layoutDesigner.findSafePosition(
        { x: weekX, y: roadmapStartY },
        { width: 300, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: `${week.week}\n${week.focus}`,
          shape: 'square'
        },
        position: weekPos,
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      await sleep(CONFIG.RATE_LIMIT_DELAY);
      
      // Solutions for this week
      for (let j = 0; j < week.solutions.length; j++) {
        const solY = roadmapStartY + 120 + j * 100;
        
        const solPos = layoutDesigner.findSafePosition(
          { x: weekX, y: solY },
          { width: 280, height: 80 },
          'square'
        );
        
        await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
          data: {
            content: week.solutions[j],
            shape: 'square'
          },
          position: solPos,
          style: { fillColor: CONFIG.COLORS.LOW_PRIORITY }
        });
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create roadmap: ${error.message}`);
    return false;
  }
}

// Create success metrics dashboard
async function createSuccessMetrics() {
  log.phase('CREATING SUCCESS METRICS DASHBOARD');
  
  try {
    const frameX = implementationState.framePosition.x;
    const frameY = implementationState.framePosition.y;
    const metricsX = frameX - 200;
    const metricsY = frameY + 1100;
    
    // Dashboard header
    const headerPos = layoutDesigner.findSafePosition(
      { x: metricsX, y: metricsY },
      { width: 500, height: 80 },
      'rectangle'
    );
    
    await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
      data: {
        content: 'KEY SUCCESS METRICS - PRODUCT OUTCOME 1',
        shape: 'rectangle'
      },
      position: headerPos,
      style: { fillColor: CONFIG.COLORS.OUTCOME }
    });
    await sleep(CONFIG.RATE_LIMIT_DELAY);
    
    // Primary metrics
    const metrics = [
      'Time to first insight: < 15 minutes',
      'Tutorial completion: > 80%',
      'Template usage: > 60%',
      'Attribute mapping success: > 85%',
      'Pattern discovery rate: > 70%',
      'Return for session 2: > 60%',
      'Confidence score: > 7/10',
      'Support tickets: < 20%'
    ];
    
    for (let i = 0; i < metrics.length; i++) {
      const metricX = metricsX - 400 + (i % 4) * 300;
      const metricY = metricsY + 120 + Math.floor(i / 4) * 100;
      
      const metricPos = layoutDesigner.findSafePosition(
        { x: metricX, y: metricY },
        { width: 250, height: 80 },
        'square'
      );
      
      await miroApi.post(`/boards/${CONFIG.BOARD_ID}/sticky_notes`, {
        data: {
          content: metrics[i],
          shape: 'square'
        },
        position: metricPos,
        style: { fillColor: CONFIG.COLORS.METRIC }
      });
      implementationState.metricIds.push(metrics[i]);
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to create metrics: ${error.message}`);
    return false;
  }
}

// Save implementation state
function saveState() {
  const stateFile = 'assess-prioritize-state.json';
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
  console.log('📊 Galaxy Assess & Prioritize Implementation');
  console.log('🎯 Teresa Torres Assessment and Prioritization Framework');
  console.log('⚡ Focus: Product Outcome 1 - 15-minute insight achievement');
  console.log('');
  
  // Find the frame
  const frameFound = await findAssessFrame();
  if (!frameFound) {
    log.error('Cannot proceed without Galaxy Assess & Prioritize frame');
    console.log('\nPlease ensure you have a frame titled "Galaxy Assess & Prioritize" on your board');
    return;
  }
  
  // Create Impact vs Effort matrix
  const matrixCreated = await createImpactEffortMatrix();
  if (!matrixCreated) {
    log.error('Failed to create impact/effort matrix');
    saveState();
    return;
  }
  
  // Create Assumption Testing board
  const testingCreated = await createAssumptionTestingBoard();
  if (!testingCreated) {
    log.error('Failed to create assumption testing board');
  }
  
  // Create Evidence Assessment
  const evidenceCreated = await createEvidenceAssessment();
  if (!evidenceCreated) {
    log.error('Failed to create evidence assessment');
  }
  
  // Create Implementation Roadmap
  const roadmapCreated = await createImplementationRoadmap();
  if (!roadmapCreated) {
    log.error('Failed to create implementation roadmap');
  }
  
  // Create Success Metrics
  const metricsCreated = await createSuccessMetrics();
  if (!metricsCreated) {
    log.error('Failed to create success metrics');
  }
  
  // Generate layout report
  const layoutReport = generateLayoutReport();
  
  // Final report
  log.phase('🎉 ASSESSMENT & PRIORITIZATION COMPLETE!');
  console.log('📊 Created Teresa Torres Assessment Framework:');
  console.log(`   ✅ Impact vs Effort Matrix with ${ASSESSMENT_STRUCTURE.solutions.length} solutions`);
  console.log(`   ✅ ${ASSESSMENT_STRUCTURE.assumptionTests.length} Assumption Tests prioritized`);
  console.log('   ✅ Evidence Strength Assessment (Strong/Moderate/Weak)');
  console.log('   ✅ 4-Week Implementation Roadmap');
  console.log('   ✅ 8 Key Success Metrics');
  
  console.log('\n🎯 Quick Wins Identified:');
  console.log('   • S1.2: Quick Start Templates (3 days)');
  console.log('   • S3.3: Visual Hierarchy Optimization (3 days)');
  console.log('   • S3.1: Smart Highlighting System (1 week)');
  
  console.log('\n🔬 Riskiest Assumptions to Test:');
  console.log('   • Users can learn 3D navigation');
  console.log('   • Templates accelerate value discovery');
  console.log('   • Visual hierarchy aids pattern discovery');
  
  if (implementationState.errors.length > 0) {
    console.log('\n⚠️  Some errors occurred:');
    implementationState.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('');
  console.log('🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/');
  console.log('📖 Teresa Torres: Test assumptions before building');
  console.log('🎨 Layout Designer ensured optimal spacing and visibility');
  
  saveState();
}

if (require.main === module) {
  main().catch(console.error);
}