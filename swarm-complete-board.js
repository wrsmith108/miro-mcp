#!/usr/bin/env node
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🐝 Board Completion Swarm Orchestrator');
console.log('═'.repeat(70));
console.log('Objective: Complete board to 100% parity with original');
console.log('Strategy: 3-phase execution with specialized agents');
console.log('═'.repeat(70));

// Agent definitions
const AGENTS = {
  cleanup: {
    name: 'CleanupAgent',
    script: './cleanup-duplicates.js',
    description: 'Remove duplicates and fix structure'
  },
  section4: {
    name: 'GridAgent',
    script: './complete-section4.js',
    description: 'Complete Section 4 ideation grids'
  },
  section5: {
    name: 'StoryAgent',
    script: './complete-section5.js',
    description: 'Complete Section 5 story maps'
  },
  section6: {
    name: 'TestAgent',
    script: './complete-section6.js',
    description: 'Complete Section 6 test canvases'
  },
  visual: {
    name: 'VisualAgent',
    script: './create-visuals.js',
    description: 'Add diagrams and visual elements'
  },
  verify: {
    name: 'QAAgent',
    script: './run-comprehensive-audit.js',
    description: 'Verify board completion'
  }
};

// Execution phases
const PHASES = [
  {
    name: 'Phase 1: Cleanup & Structure',
    agents: ['cleanup'],
    parallel: false,
    expectedTime: '2 hours'
  },
  {
    name: 'Phase 2: Content Completion',
    agents: ['section4', 'section5', 'section6'],
    parallel: true,
    expectedTime: '6 hours'
  },
  {
    name: 'Phase 3: Visual Elements',
    agents: ['visual'],
    parallel: false,
    expectedTime: '3 hours'
  },
  {
    name: 'Final: Verification',
    agents: ['verify'],
    parallel: false,
    expectedTime: '30 minutes'
  }
];

// Progress tracking
let completedTasks = 0;
const totalTasks = PHASES.reduce((sum, phase) => sum + phase.agents.length, 0);

// Utility function to run a script
async function runAgent(agentKey) {
  const agent = AGENTS[agentKey];
  console.log(`\n🤖 ${agent.name}: ${agent.description}`);
  console.log('   Running:', agent.script);
  
  try {
    const { stdout, stderr } = await execPromise(`node ${agent.script}`);
    
    // Parse output for key metrics
    const lines = stdout.split('\n');
    const summaryLine = lines.find(l => l.includes('✅') || l.includes('Summary'));
    if (summaryLine) {
      console.log(`   Result: ${summaryLine.trim()}`);
    }
    
    completedTasks++;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    console.log(`   ✓ Complete (Overall progress: ${progress}%)`);
    
    return { success: true, output: stdout };
  } catch (error) {
    console.error(`   ✗ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main orchestration
async function orchestrateSwarm() {
  console.log('\n🚀 Starting Swarm Execution');
  console.log(`Total tasks: ${totalTasks}`);
  console.log('─'.repeat(70));
  
  const startTime = Date.now();
  const results = {};
  
  for (const phase of PHASES) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📋 ${phase.name}`);
    console.log(`   Expected time: ${phase.expectedTime}`);
    console.log(`   Parallel execution: ${phase.parallel ? 'Yes' : 'No'}`);
    console.log('─'.repeat(70));
    
    const phaseStart = Date.now();
    
    if (phase.parallel) {
      // Run agents in parallel
      const promises = phase.agents.map(agent => runAgent(agent));
      const phaseResults = await Promise.all(promises);
      
      phase.agents.forEach((agent, i) => {
        results[agent] = phaseResults[i];
      });
    } else {
      // Run agents sequentially
      for (const agent of phase.agents) {
        results[agent] = await runAgent(agent);
      }
    }
    
    const phaseTime = Math.round((Date.now() - phaseStart) / 1000);
    console.log(`\n   Phase completed in ${phaseTime} seconds`);
  }
  
  // Final summary
  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
  
  console.log('\n' + '═'.repeat(70));
  console.log('🎯 SWARM EXECUTION COMPLETE');
  console.log('═'.repeat(70));
  
  // Check results
  const failures = Object.entries(results).filter(([_, result]) => !result.success);
  const successes = Object.entries(results).filter(([_, result]) => result.success);
  
  console.log(`\n   Total time: ${totalTime} minutes`);
  console.log(`   Successful agents: ${successes.length}/${totalTasks}`);
  console.log(`   Failed agents: ${failures.length}`);
  
  if (failures.length > 0) {
    console.log('\n   ⚠️  Failed agents:');
    failures.forEach(([agent, result]) => {
      console.log(`      - ${AGENTS[agent].name}: ${result.error}`);
    });
  }
  
  // Parse verification results if available
  if (results.verify && results.verify.success) {
    const verifyOutput = results.verify.output;
    const completionMatch = verifyOutput.match(/Overall Grade: ([A-F][+]?)/);
    const percentMatch = verifyOutput.match(/Completion: (\d+)%/);
    
    if (completionMatch && percentMatch) {
      const grade = completionMatch[1];
      const percent = percentMatch[1];
      
      console.log('\n   📊 Final Board Status:');
      console.log(`      Grade: ${grade}`);
      console.log(`      Completion: ${percent}%`);
      
      if (percent === '100') {
        console.log('\n   🎉 BOARD IS 100% COMPLETE! 🎉');
      } else {
        console.log(`\n   📝 Board is ${percent}% complete. Run individual agents to finish.`);
      }
    }
  }
  
  console.log('\n' + '═'.repeat(70));
}

// Check if scripts exist
async function checkScripts() {
  const fs = require('fs');
  const missing = [];
  
  Object.values(AGENTS).forEach(agent => {
    if (!fs.existsSync(agent.script)) {
      missing.push(agent.script);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n⚠️  Missing scripts:');
    missing.forEach(script => console.log(`   - ${script}`));
    console.log('\nPlease ensure all agent scripts are created before running the swarm.');
    return false;
  }
  
  return true;
}

// Main execution
async function main() {
  console.log('\n🔍 Pre-flight checks...');
  
  const scriptsReady = await checkScripts();
  if (!scriptsReady) {
    console.log('\n❌ Swarm cannot start. Missing required scripts.');
    process.exit(1);
  }
  
  console.log('   ✓ All agent scripts found');
  console.log('   ✓ Ready to start swarm');
  
  // Add countdown
  console.log('\n⏱️  Starting in:');
  for (let i = 3; i > 0; i--) {
    console.log(`   ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('   GO! 🚀');
  
  // Run orchestration
  await orchestrateSwarm();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { orchestrateSwarm, AGENTS, PHASES };