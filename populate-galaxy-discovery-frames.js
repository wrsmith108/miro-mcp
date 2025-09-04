#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${process.env.MIRO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Frame IDs
const frames = {
  ostV2: { id: '3458764638806465440', position: { x: 6784, y: 17424 } },
  rankedTests: { id: '3458764638806465763', position: { x: 11005, y: 18683 } },
  testPriority: { id: '3458764638806506560', position: { x: 15187, y: 18683 } },
  goNoGo: { id: '3458764638806506667', position: { x: 19369, y: 18683 } },
  riskMitigation: { id: '3458764638806506789', position: { x: 23550, y: 18683 } },
  successMetrics: { id: '3458764638806506858', position: { x: 27732, y: 18683 } }
};

// Color scheme following Teresa Torres model
const colors = {
  outcome: 'blue',           // Primary outcome
  opportunity: 'yellow',     // Opportunities/problems
  solution: 'green',        // Solutions
  assumption: 'orange',     // Assumptions to test
  test: 'light_pink',       // Test methods
  criteria: 'red',          // Critical criteria
  metric: 'light_blue',     // Metrics
  risk: 'violet',           // Risks
  action: 'light_green'     // Actions/mitigations
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createSticky(boardId, content, x, y, color = 'yellow', width = 248) {
  try {
    const response = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
      data: {
        content: content,
        shape: 'square'
      },
      position: { x, y },
      style: { fillColor: color },
      geometry: { width }
    });
    await sleep(50); // Rate limiting
    return response.data.id;
  } catch (error) {
    console.error(`Failed to create sticky: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function createConnector(boardId, startId, endId) {
  try {
    await miroApi.post(`/boards/${boardId}/connectors`, {
      startItem: { id: startId },
      endItem: { id: endId },
      style: {
        startStrokeCap: 'none',
        endStrokeCap: 'arrow',
        strokeColor: '#424867',
        strokeWidth: 2
      }
    });
    await sleep(50);
  } catch (error) {
    console.error(`Failed to create connector: ${error.response?.data?.message || error.message}`);
  }
}

async function populateOSTv2(boardId) {
  console.log('\n📊 Creating OST V2 (Opportunity Solution Tree)...\n');
  const baseX = frames.ostV2.position.x;
  const baseY = frames.ostV2.position.y;
  const createdItems = {};

  // Primary Outcome (top of tree)
  const outcomeId = await createSticky(boardId, 
    '🎯 PRIMARY OUTCOME\nAchieve confirmed willingness to pay for democratized expert analysis\n\n📊 Target: 25%+ trial-to-paid conversion',
    baseX + 1800, baseY + 200, colors.outcome, 350);
  createdItems.outcome = outcomeId;
  console.log('✅ Created primary outcome');

  // Tier 1 Opportunities (Critical Pain Points)
  const opportunities = [
    {
      id: 'o1',
      content: 'O1: Multi-Dimensional Analysis Paralysis\n\n📍 Both segments (10/10 pain)\n⏱️ 60% insights take 20-30 hours\n🔍 Interaction effects invisible',
      x: baseX + 300, y: baseY + 600
    },
    {
      id: 'o2',
      content: 'O2: Real-Time Exploration Bottleneck\n\n📍 Consulting (9/10 pain)\n⏱️ 40% questions need 2-3 day follow-up\n💸 Lost momentum costs $50K+',
      x: baseX + 900, y: baseY + 600
    },
    {
      id: 'o3',
      content: 'O3: Regulatory Compliance Complexity\n\n📍 Banking (9/10 pain)\n📋 OSFI B-15: 10 sectors, 4 scenarios\n⚠️ 15% error rate risks $20M fines',
      x: baseX + 1500, y: baseY + 600
    },
    {
      id: 'o4',
      content: 'O4: Pattern Recognition Failure\n\n📍 Both (9/10, 8/10)\n👁️ Miss 60% patterns in traditional tools\n💰 Requires expensive data scientists',
      x: baseX + 2100, y: baseY + 600
    },
    {
      id: 'o5',
      content: 'O5: Expertise Bottleneck\n\n📍 Both segments\n👨‍💼 Juniors can\'t do senior analysis\n📚 Knowledge transfer takes months',
      x: baseX + 2700, y: baseY + 600
    },
    {
      id: 'o6',
      content: 'O6: Cross-Functional Data Integration\n\n📍 Consulting (9/10 pain)\n⏱️ 15-20 hours weekly consolidating\n❌ 30% error rate',
      x: baseX + 3300, y: baseY + 600
    }
  ];

  for (const opp of opportunities) {
    const id = await createSticky(boardId, opp.content, opp.x, opp.y, colors.opportunity, 280);
    createdItems[opp.id] = id;
    console.log(`✅ Created opportunity ${opp.id}`);
  }

  // Solution Sets
  const solutions = [
    {
      id: 's1',
      content: 'Solution Set A: Spatial Visualization\n\n✓ Cylindrical Coordinate System\n✓ 11+ dimensions simultaneously\n✓ Pre-attentive pattern recognition',
      x: baseX + 400, y: baseY + 1100
    },
    {
      id: 's2',
      content: 'Solution Set B: Interactive Exploration\n\n✓ Real-Time Reconfiguration\n✓ Dynamic Origin Assignment\n✓ Instant what-if scenarios',
      x: baseX + 1100, y: baseY + 1100
    },
    {
      id: 's3',
      content: 'Solution Set C: Hierarchical Navigation\n\n✓ 4-tier drill-down architecture\n✓ Context-preserving zoom\n✓ Automated normalization',
      x: baseX + 1800, y: baseY + 1100
    },
    {
      id: 's4',
      content: 'Solution Set D: Compliance Features\n\n✓ Audit trail visualization\n✓ OSFI/Basel III templates\n✓ Multi-scenario parallel views',
      x: baseX + 2500, y: baseY + 1100
    }
  ];

  for (const sol of solutions) {
    const id = await createSticky(boardId, sol.content, sol.x, sol.y, colors.solution, 300);
    createdItems[sol.id] = id;
    console.log(`✅ Created solution ${sol.id}`);
  }

  // Create connections
  console.log('\n🔗 Creating OST connections...');
  
  // Connect outcome to opportunities
  for (const oppKey of ['o1', 'o2', 'o3', 'o4', 'o5', 'o6']) {
    if (createdItems.outcome && createdItems[oppKey]) {
      await createConnector(boardId, createdItems.outcome, createdItems[oppKey]);
    }
  }

  // Connect opportunities to solutions
  const oppToSol = {
    'o1': ['s1', 's3'],
    'o2': ['s2'],
    'o3': ['s3', 's4'],
    'o4': ['s1', 's2'],
    'o5': ['s1'],
    'o6': ['s3']
  };

  for (const [opp, sols] of Object.entries(oppToSol)) {
    for (const sol of sols) {
      if (createdItems[opp] && createdItems[sol]) {
        await createConnector(boardId, createdItems[opp], createdItems[sol]);
      }
    }
  }

  return createdItems;
}

async function populateRankedAssumptionTests(boardId) {
  console.log('\n🔬 Creating Ranked Assumption Tests...\n');
  const baseX = frames.rankedTests.position.x;
  const baseY = frames.rankedTests.position.y;
  const createdItems = {};

  // Common Assumptions (Both Segments)
  const commonAssumptions = [
    {
      id: 'a1',
      content: 'A1: Spatial Thinking Advantage [HIGHEST RISK]\n\n🎯 Users interpret 11+ dimensions without overload\n📊 Test: Comprehension with 20 analysts\n✅ Success: 80%+ accuracy, 2x more patterns',
      x: baseX + 300, y: baseY + 300
    },
    {
      id: 'a2',
      content: 'A2: Trust in Visual Analytics [HIGH RISK]\n\n🎯 Trust spatial viz for high-stakes decisions\n📊 Test: $1M+ decision scenarios\n✅ Success: 70%+ trust for critical decisions',
      x: baseX + 900, y: baseY + 300
    },
    {
      id: 'a3',
      content: 'A3: Learning Curve Reality [HIGH RISK]\n\n🎯 Productive in 2 weeks vs 2+ months\n📊 Test: Time-to-first-insight study\n✅ Success: First insight <2 hours',
      x: baseX + 1500, y: baseY + 300
    },
    {
      id: 'a4',
      content: 'A4: Pattern Recognition [MEDIUM RISK]\n\n🎯 Spatial reveals invisible patterns\n📊 Test: Planted pattern test\n✅ Success: Find 80%+ patterns, 50% faster',
      x: baseX + 2100, y: baseY + 300
    },
    {
      id: 'a5',
      content: 'A5: Value at Price Point [MEDIUM RISK]\n\n🎯 Pay $50-100K (consulting) / $250K (banking)\n📊 Test: Van Westendorp pricing\n✅ Success: 30%+ see "good value"',
      x: baseX + 2700, y: baseY + 300
    }
  ];

  for (const assumption of commonAssumptions) {
    const id = await createSticky(boardId, assumption.content, assumption.x, assumption.y, colors.assumption, 280);
    createdItems[assumption.id] = id;
    console.log(`✅ Created common assumption ${assumption.id}`);
  }

  // Consulting-Specific Assumptions
  console.log('\n📈 Creating Consulting-specific assumptions...');
  const consultingAssumptions = [
    {
      id: 'c1',
      content: 'C1: Real-Time Client Value [HIGH RISK]\n\n💼 CONSULTING SPECIFIC\n🎯 Live exploration drives decisions\n📊 Test: Simulated client workshop\n✅ Success: Answer 80% real-time',
      x: baseX + 400, y: baseY + 900
    },
    {
      id: 'c2',
      content: 'C2: PowerPoint Export [HIGH RISK]\n\n💼 CONSULTING SPECIFIC\n🎯 Meets presentation standards\n📊 Test: Export quality assessment\n✅ Success: Pixel-perfect, one-click',
      x: baseX + 1000, y: baseY + 900
    },
    {
      id: 'c3',
      content: 'C3: Hypothesis Iteration [MEDIUM RISK]\n\n💼 CONSULTING SPECIFIC\n🎯 10x faster hypothesis testing\n📊 Test: Iteration workshop\n✅ Success: 10+ hypotheses/session',
      x: baseX + 1600, y: baseY + 900
    }
  ];

  for (const assumption of consultingAssumptions) {
    const id = await createSticky(boardId, assumption.content, assumption.x, assumption.y, colors.test, 280);
    createdItems[assumption.id] = id;
    console.log(`✅ Created consulting assumption ${assumption.id}`);
  }

  // Banking-Specific Assumptions
  console.log('\n🏦 Creating Banking-specific assumptions...');
  const bankingAssumptions = [
    {
      id: 'b1',
      content: 'B1: Regulatory Compliance [HIGHEST RISK]\n\n🏦 BANKING SPECIFIC\n🎯 Meet regulatory requirements\n📊 Test: Compliance officer review\n✅ Success: 100% requirements met',
      x: baseX + 400, y: baseY + 1400
    },
    {
      id: 'b2',
      content: 'B2: Enterprise Security [HIGH RISK]\n\n🏦 BANKING SPECIFIC\n🎯 Bank-grade security standards\n📊 Test: Security architecture review\n✅ Success: Pass security review',
      x: baseX + 1000, y: baseY + 1400
    },
    {
      id: 'b3',
      content: 'B3: Scale Performance [MEDIUM RISK]\n\n🏦 BANKING SPECIFIC\n🎯 Handle millions of transactions\n📊 Test: Load testing at scale\n✅ Success: <3 sec at 10M+ points',
      x: baseX + 1600, y: baseY + 1400
    },
    {
      id: 'b4',
      content: 'B4: Risk Pattern Detection [MEDIUM RISK]\n\n🏦 BANKING SPECIFIC\n🎯 Improve risk identification\n📊 Test: Historical fraud analysis\n✅ Success: 40% fewer false positives',
      x: baseX + 2200, y: baseY + 1400
    }
  ];

  for (const assumption of bankingAssumptions) {
    const id = await createSticky(boardId, assumption.content, assumption.x, assumption.y, colors.test, 280);
    createdItems[assumption.id] = id;
    console.log(`✅ Created banking assumption ${assumption.id}`);
  }

  return createdItems;
}

async function populateTestingPrioritization(boardId) {
  console.log('\n📅 Creating Testing Prioritization & Sequencing...\n');
  const baseX = frames.testPriority.position.x;
  const baseY = frames.testPriority.position.y;
  const createdItems = {};

  // Phase 1: Foundation
  const phase1Id = await createSticky(boardId,
    '🚀 PHASE 1: FOUNDATION (Weeks 1-2)\n\nMust Pass Before Proceeding:\n\n1. Spatial Thinking Advantage\n2. Regulatory Compliance (Banking)\n3. Enterprise Security (Banking)\n4. PowerPoint Export (Consulting)',
    baseX + 800, baseY + 400, colors.criteria, 350);
  createdItems.phase1 = phase1Id;
  console.log('✅ Created Phase 1');

  // Phase 2: Core Value
  const phase2Id = await createSticky(boardId,
    '💎 PHASE 2: CORE VALUE (Weeks 2-3)\n\nValidates Core Promise:\n\n1. Trust in Visual Analytics\n2. Pattern Recognition Superiority\n3. Real-Time Client Value (Consulting)\n4. Risk Pattern Detection (Banking)',
    baseX + 800, baseY + 900, colors.criteria, 350);
  createdItems.phase2 = phase2Id;
  console.log('✅ Created Phase 2');

  // Phase 3: Adoption Feasibility
  const phase3Id = await createSticky(boardId,
    '📈 PHASE 3: ADOPTION (Weeks 3-4)\n\nConfirms Market Fit:\n\n1. Learning Curve Reality\n2. Hypothesis Iteration Speed (Consulting)\n3. Scale Performance (Banking)',
    baseX + 800, baseY + 1400, colors.criteria, 350);
  createdItems.phase3 = phase3Id;
  console.log('✅ Created Phase 3');

  // Phase 4: Business Model
  const phase4Id = await createSticky(boardId,
    '💰 PHASE 4: BUSINESS MODEL (Weeks 4-5)\n\nValidates Commercialization:\n\n1. Value Perception at Price Point\n2. ROI demonstration methods\n3. Proof of concept success metrics',
    baseX + 800, baseY + 1900, colors.criteria, 350);
  createdItems.phase4 = phase4Id;
  console.log('✅ Created Phase 4');

  // Dependencies
  const dependencies = [
    {
      content: '⚠️ CRITICAL PATH\n\nSpatial Thinking MUST succeed\nor entire premise fails',
      x: baseX + 1400,
      y: baseY + 600
    },
    {
      content: '🔄 ITERATION POINTS\n\nAfter each phase:\n- Review results\n- Adjust approach\n- Update assumptions',
      x: baseX + 1400,
      y: baseY + 1100
    },
    {
      content: '📊 PARALLEL TRACKS\n\nConsulting & Banking\ntested simultaneously\nwhere possible',
      x: baseX + 1400,
      y: baseY + 1600
    }
  ];

  for (let i = 0; i < dependencies.length; i++) {
    const dep = dependencies[i];
    const id = await createSticky(boardId, dep.content, dep.x, dep.y, colors.action, 250);
    createdItems[`dep${i}`] = id;
    console.log(`✅ Created dependency note ${i + 1}`);
  }

  // Connect phases sequentially
  if (createdItems.phase1 && createdItems.phase2) {
    await createConnector(boardId, createdItems.phase1, createdItems.phase2);
  }
  if (createdItems.phase2 && createdItems.phase3) {
    await createConnector(boardId, createdItems.phase2, createdItems.phase3);
  }
  if (createdItems.phase3 && createdItems.phase4) {
    await createConnector(boardId, createdItems.phase3, createdItems.phase4);
  }

  return createdItems;
}

async function populateGoNoGoCriteria(boardId) {
  console.log('\n✅ Creating Go/No-Go Decision Criteria...\n');
  const baseX = frames.goNoGo.position.x;
  const baseY = frames.goNoGo.position.y;
  const createdItems = {};

  // Proceed Criteria
  const proceedId = await createSticky(boardId,
    '✅ PROCEED TO FULL DEVELOPMENT IF:\n\n• Spatial Thinking: ≥80% comprehension accuracy\n• Trust: ≥70% would use for critical decisions\n• Learning: Productive within 2 weeks confirmed\n• Consulting: Real-time value demonstrated\n• Banking: Regulatory compliance confirmed\n• Pricing: ≥25% see strong value at target price',
    baseX + 800, baseY + 400, colors.solution, 400);
  createdItems.proceed = proceedId;
  console.log('✅ Created Proceed criteria');

  // Pivot Criteria
  const pivotId = await createSticky(boardId,
    '🔄 PIVOT REQUIRED IF:\n\n• Spatial thinking advantage not demonstrated\n• Trust scores <50%\n• Learning curve >1 month\n• Regulatory compliance gaps identified\n• Price resistance >80%',
    baseX + 800, baseY + 1000, colors.opportunity, 400);
  createdItems.pivot = pivotId;
  console.log('✅ Created Pivot criteria');

  // Kill Criteria
  const killId = await createSticky(boardId,
    '🛑 KILL CRITERIA:\n\n• <50% comprehension accuracy\n• Fundamental security/compliance blockers\n• No measurable advantage over existing tools\n• <10% willingness to pay at any price point',
    baseX + 800, baseY + 1600, colors.criteria, 400);
  createdItems.kill = killId;
  console.log('✅ Created Kill criteria');

  // Decision Thresholds
  const thresholds = [
    {
      content: '📊 THRESHOLD METRICS\n\nComprehension: 80%\nTrust: 70%\nConversion: 25%\nLearning: 14 days',
      x: baseX + 1400,
      y: baseY + 600
    },
    {
      content: '⏱️ DECISION TIMING\n\nPhase 1: Day 14\nPhase 2: Day 21\nPhase 3: Day 28\nFinal: Day 35',
      x: baseX + 1400,
      y: baseY + 1000
    },
    {
      content: '👥 DECISION MAKERS\n\nProduct Lead\nEngineering Lead\nSales Lead\n2 Customer Advisors',
      x: baseX + 1400,
      y: baseY + 1400
    }
  ];

  for (let i = 0; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    const id = await createSticky(boardId, threshold.content, threshold.x, threshold.y, colors.metric, 250);
    createdItems[`threshold${i}`] = id;
    console.log(`✅ Created threshold ${i + 1}`);
  }

  return createdItems;
}

async function populateRiskMitigation(boardId) {
  console.log('\n🛡️ Creating Risk Mitigation Strategies...\n');
  const baseX = frames.riskMitigation.position.x;
  const baseY = frames.riskMitigation.position.y;
  const createdItems = {};

  // Risk Mitigations
  const mitigations = [
    {
      id: 'mit1',
      content: '🧠 IF SPATIAL THINKING FAILS:\n\n• Add progressive disclosure (start 3-4 dimensions)\n• Develop guided analysis templates\n• Increase training/onboarding support\n• Consider simplified "starter mode"',
      x: baseX + 400, y: baseY + 400
    },
    {
      id: 'mit2',
      content: '🤝 IF TRUST IS LOW:\n\n• Add "proof" overlays showing calculations\n• Provide side-by-side traditional view\n• Include audit trail for every insight\n• Get endorsements from respected analysts',
      x: baseX + 1000, y: baseY + 400
    },
    {
      id: 'mit3',
      content: '📚 IF LEARNING CURVE TOO STEEP:\n\n• Create role-specific interfaces\n• Develop interactive tutorials\n• Offer managed service option initially\n• Build template library',
      x: baseX + 1600, y: baseY + 400
    },
    {
      id: 'mit4',
      content: '💰 IF PRICE RESISTANCE HIGH:\n\n• Test freemium model with limits\n• Offer pilot/POC pricing\n• Bundle with consulting services\n• Create value calculator tool',
      x: baseX + 2200, y: baseY + 400
    }
  ];

  for (const mit of mitigations) {
    const id = await createSticky(boardId, mit.content, mit.x, mit.y, colors.risk, 280);
    createdItems[mit.id] = id;
    console.log(`✅ Created mitigation ${mit.id}`);
  }

  // Contingency Plans
  const contingencies = [
    {
      content: '🔄 PIVOT OPTIONS:\n\n1. Expert Enhancement Tool\n2. Communication Platform\n3. Specific Domain Solution\n4. Managed Service Model',
      x: baseX + 600, y: baseY + 1000
    },
    {
      content: '🎯 FOCUS STRATEGIES:\n\n• Double down on strongest segment\n• Narrow to specific use case\n• Partner with consultancy\n• White-label option',
      x: baseX + 1200, y: baseY + 1000
    },
    {
      content: '⚡ QUICK WINS:\n\n• Demo compelling use case\n• Get champion testimonial\n• Show clear ROI\n• Reduce complexity',
      x: baseX + 1800, y: baseY + 1000
    }
  ];

  for (let i = 0; i < contingencies.length; i++) {
    const cont = contingencies[i];
    const id = await createSticky(boardId, cont.content, cont.x, cont.y, colors.action, 280);
    createdItems[`cont${i}`] = id;
    console.log(`✅ Created contingency ${i + 1}`);
  }

  return createdItems;
}

async function populateSuccessMetrics(boardId) {
  console.log('\n📈 Creating Success Metrics & Tracking...\n');
  const baseX = frames.successMetrics.position.x;
  const baseY = frames.successMetrics.position.y;
  const createdItems = {};

  // Leading Indicators
  const leadingId = await createSticky(boardId,
    '📊 LEADING INDICATORS (Weekly)\n\n• Time to first insight\n• Number of dimensions used effectively\n• Patterns discovered per session\n• User confidence scores\n• Feature adoption rate',
    baseX + 400, baseY + 400, colors.metric, 350);
  createdItems.leading = leadingId;
  console.log('✅ Created Leading Indicators');

  // Lagging Indicators
  const laggingId = await createSticky(boardId,
    '📈 LAGGING INDICATORS (Monthly)\n\n• Trial-to-paid conversion rate\n• User retention rate\n• Expansion within accounts\n• NPS/recommendation scores\n• Support ticket volume',
    baseX + 1000, baseY + 400, colors.metric, 350);
  createdItems.lagging = laggingId;
  console.log('✅ Created Lagging Indicators');

  // Ultimate Success
  const ultimateId = await createSticky(boardId,
    '🎯 ULTIMATE SUCCESS (Quarterly)\n\n• Revenue per customer\n• Market penetration rate\n• Competitive win rate\n• Customer success stories\n• Category creation evidence',
    baseX + 1600, baseY + 400, colors.outcome, 350);
  createdItems.ultimate = ultimateId;
  console.log('✅ Created Ultimate Success');

  // Target Metrics
  const targets = [
    {
      content: '🎯 WEEK 1-2 TARGETS\n\n• 80% comprehension\n• <2 hour first insight\n• 70% trust score',
      x: baseX + 400, y: baseY + 1000
    },
    {
      content: '🎯 WEEK 3-4 TARGETS\n\n• 2x pattern discovery\n• 50% faster analysis\n• 90% retention',
      x: baseX + 900, y: baseY + 1000
    },
    {
      content: '🎯 WEEK 5 TARGETS\n\n• 25% conversion\n• 30% value perception\n• Clear ROI story',
      x: baseX + 1400, y: baseY + 1000
    },
    {
      content: '🎯 SEGMENT TARGETS\n\nConsulting: $200K value/engagement\nBanking: $100M risk prevention',
      x: baseX + 1900, y: baseY + 1000
    }
  ];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const id = await createSticky(boardId, target.content, target.x, target.y, colors.action, 250);
    createdItems[`target${i}`] = id;
    console.log(`✅ Created target ${i + 1}`);
  }

  // Tracking Methods
  const trackingId = await createSticky(boardId,
    '📋 TRACKING METHODS\n\n• Amplitude for product analytics\n• User session recordings\n• Weekly user interviews\n• Conversion funnel analysis\n• Cohort retention tracking',
    baseX + 1200, baseY + 1500, colors.solution, 300);
  createdItems.tracking = trackingId;
  console.log('✅ Created Tracking Methods');

  return createdItems;
}

async function main() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log('🚀 Starting Galaxy Discovery Board Population\n');
    console.log(`Board ID: ${boardId}`);
    console.log('=' .repeat(60));

    // Store all created items for potential connector creation
    const allItems = {};

    // Populate each frame
    allItems.ostV2 = await populateOSTv2(boardId);
    allItems.rankedTests = await populateRankedAssumptionTests(boardId);
    allItems.testPriority = await populateTestingPrioritization(boardId);
    allItems.goNoGo = await populateGoNoGoCriteria(boardId);
    allItems.riskMitigation = await populateRiskMitigation(boardId);
    allItems.successMetrics = await populateSuccessMetrics(boardId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPLETE! Galaxy Discovery Board has been populated');
    console.log('=' .repeat(60));
    console.log('\n📊 Summary:');
    console.log('- OST V2: Opportunity Solution Tree created');
    console.log('- Ranked Assumption Tests: Common + Segment-specific tests');
    console.log('- Testing Prioritization: 4-phase sequencing');
    console.log('- Go/No-Go Criteria: Clear decision thresholds');
    console.log('- Risk Mitigation: Strategies for each failure mode');
    console.log('- Success Metrics: Leading, lagging, and ultimate metrics');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

main();