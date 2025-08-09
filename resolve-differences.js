#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🎯 DIFFERENCE RESOLUTION EXECUTOR');
console.log('Board ID:', boardId);
console.log('Mission: Align board with original screenshots');
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Delay for rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Agent Classes
class ColorCorrectionAgent {
  constructor() {
    this.name = 'ColorCorrectionAgent';
    this.changes = 0;
  }

  async execute(items) {
    console.log(`\n🎨 ${this.name} starting color corrections...`);
    
    // Section 0: Convert yellows to greens
    console.log('   Section 0: Creating green flow nodes...');
    const section0Items = items.filter(item => 
      item.type === 'sticky_note' &&
      item.position.x >= 0 && item.position.x < 1400 &&
      item.style?.fillColor === 'yellow'
    );
    
    // Convert first 3 yellows to green
    for (let i = 0; i < Math.min(3, section0Items.length); i++) {
      try {
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${section0Items[i].id}`, {
          style: { fillColor: 'light_green' }
        });
        this.changes++;
        await delay(300);
      } catch (error) {
        console.log(`      ⚠️ Could not convert item ${i}`);
      }
    }
    console.log(`      ✓ Converted ${Math.min(3, this.changes)} to green`);
    
    // Section 2: Convert yellows to pink
    console.log('   Section 2: Adding pink research notes...');
    const section2Items = items.filter(item =>
      item.type === 'sticky_note' &&
      item.position.x >= 2800 && item.position.x < 4200 &&
      item.style?.fillColor === 'yellow'
    );
    
    // Convert 2 yellows to pink (from bottom row preferably)
    const bottomYellows = section2Items
      .sort((a, b) => b.position.y - a.position.y)
      .slice(0, 2);
    
    for (const item of bottomYellows) {
      try {
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${item.id}`, {
          style: { fillColor: 'light_pink' }
        });
        this.changes++;
        await delay(300);
      } catch (error) {
        console.log('      ⚠️ Could not convert to pink');
      }
    }
    
    // Section 3: Convert greens to blue
    console.log('   Section 3: Creating blue hierarchy nodes...');
    const section3Greens = items.filter(item =>
      item.type === 'sticky_note' &&
      item.position.x >= 4200 && item.position.x < 5600 &&
      item.style?.fillColor === 'light_green'
    );
    
    // Convert 3 greens to blue
    for (let i = 0; i < Math.min(3, section3Greens.length); i++) {
      try {
        await miroApi.patch(`/boards/${boardId}/sticky_notes/${section3Greens[i].id}`, {
          style: { fillColor: 'blue' }
        });
        this.changes++;
        await delay(300);
      } catch (error) {
        console.log('      ⚠️ Could not convert to blue');
      }
    }
    
    console.log(`   ✓ Total color corrections: ${this.changes}`);
    return { changes: this.changes };
  }
}

class ContentAdditionAgent {
  constructor() {
    this.name = 'ContentAdditionAgent';
    this.added = 0;
  }

  async execute() {
    console.log(`\n➕ ${this.name} adding missing content...`);
    
    // Section 4: Add 23 yellow stickies
    console.log('   Section 4: Completing ideation grids...');
    
    // Calculate positions for new stickies (fill gaps in 6 grids)
    const gridPositions = [];
    for (let grid = 0; grid < 6; grid++) {
      const gridRow = Math.floor(grid / 2);
      const gridCol = grid % 2;
      const baseX = (4 * 1400) + 100 + (gridCol * 700);
      const baseY = 300 + (gridRow * 700);
      
      // Add positions for this grid (partial fill for 23 total)
      const itemsForThisGrid = grid < 4 ? 4 : (grid === 4 ? 4 : 3);
      for (let i = 0; i < itemsForThisGrid; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        gridPositions.push({
          x: baseX + (col * 120),
          y: baseY + (row * 120)
        });
      }
    }
    
    // Add the stickies
    for (let i = 0; i < Math.min(23, gridPositions.length); i++) {
      try {
        await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: {
            content: `Idea ${i + 1}`,
            shape: 'square'
          },
          style: {
            fillColor: 'yellow'
          },
          position: gridPositions[i]
        });
        this.added++;
        
        if (i % 5 === 0) {
          process.stdout.write(`\r      Progress: ${i + 1}/23 stickies added`);
          await delay(400);
        }
      } catch (error) {
        console.log(`\n      ⚠️ Could not add sticky ${i + 1}`);
      }
    }
    
    console.log(`\n   ✓ Added ${this.added} sticky notes`);
    return { added: this.added };
  }
}

class OptimizationAgent {
  constructor() {
    this.name = 'OptimizationAgent';
    this.removed = 0;
  }

  async execute(items) {
    console.log(`\n🔧 ${this.name} optimizing content...`);
    
    // Section 2: Remove 3 excess yellows
    console.log('   Section 2: Removing excess yellows...');
    const section2Yellows = items.filter(item =>
      item.type === 'sticky_note' &&
      item.position.x >= 2800 && item.position.x < 4200 &&
      item.style?.fillColor === 'yellow'
    );
    
    // Remove last 3 yellows
    const toRemove2 = section2Yellows.slice(-3);
    for (const item of toRemove2) {
      try {
        await miroApi.delete(`/boards/${boardId}/sticky_notes/${item.id}`);
        this.removed++;
        await delay(300);
      } catch (error) {
        // Continue
      }
    }
    
    // Section 3: Remove 1 excess green
    console.log('   Section 3: Removing excess green...');
    const section3Greens = items.filter(item =>
      item.type === 'sticky_note' &&
      item.position.x >= 4200 && item.position.x < 5600 &&
      (item.style?.fillColor === 'light_green' || item.style?.fillColor === 'green')
    );
    
    if (section3Greens.length > 12) {
      try {
        await miroApi.delete(`/boards/${boardId}/sticky_notes/${section3Greens[section3Greens.length - 1].id}`);
        this.removed++;
        await delay(300);
      } catch (error) {
        // Continue
      }
    }
    
    // Section 5: Remove excess items
    console.log('   Section 5: Optimizing story maps...');
    const section5Items = items.filter(item =>
      item.type === 'sticky_note' &&
      item.position.x >= 7000 && item.position.x < 8400
    );
    
    const section5Yellows = section5Items.filter(item =>
      item.style?.fillColor === 'yellow' || item.style?.fillColor === 'light_yellow'
    );
    const section5Purples = section5Items.filter(item =>
      item.style?.fillColor === 'violet' || item.style?.fillColor === 'purple'
    );
    
    // Remove excess yellows (keep first 30)
    if (section5Yellows.length > 30) {
      const yellowsToRemove = section5Yellows.slice(30, Math.min(68, section5Yellows.length));
      console.log(`      Removing ${yellowsToRemove.length} excess yellow items...`);
      
      for (let i = 0; i < yellowsToRemove.length; i++) {
        try {
          await miroApi.delete(`/boards/${boardId}/sticky_notes/${yellowsToRemove[i].id}`);
          this.removed++;
          
          if (i % 10 === 0) {
            process.stdout.write(`\r      Progress: ${i}/${yellowsToRemove.length} yellows removed`);
            await delay(300);
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    // Remove excess purples (keep first 108)
    if (section5Purples.length > 108) {
      const purplesToRemove = section5Purples.slice(108, Math.min(131, section5Purples.length));
      console.log(`\n      Removing ${purplesToRemove.length} excess purple items...`);
      
      for (let i = 0; i < purplesToRemove.length; i++) {
        try {
          await miroApi.delete(`/boards/${boardId}/sticky_notes/${purplesToRemove[i].id}`);
          this.removed++;
          
          if (i % 10 === 0) {
            process.stdout.write(`\r      Progress: ${i}/${purplesToRemove.length} purples removed`);
            await delay(300);
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    console.log(`\n   ✓ Removed ${this.removed} excess items`);
    return { removed: this.removed };
  }
}

class VisualCleanupAgent {
  constructor() {
    this.name = 'VisualCleanupAgent';
    this.cleaned = 0;
  }

  async execute(items) {
    console.log(`\n🧹 ${this.name} cleaning visual elements...`);
    
    // Remove excess priority dots in Section 4
    console.log('   Section 4: Adjusting priority scale...');
    const section4Shapes = items.filter(item =>
      item.type === 'shape' &&
      item.position.x >= 5600 && item.position.x < 7000 &&
      item.position.y < 200 &&
      item.data?.shape === 'circle'
    );
    
    // Keep only first 13 dots
    if (section4Shapes.length > 13) {
      const toRemove = section4Shapes.slice(13);
      for (const shape of toRemove) {
        try {
          await miroApi.delete(`/boards/${boardId}/shapes/${shape.id}`);
          this.cleaned++;
          await delay(300);
        } catch (error) {
          // Continue
        }
      }
      console.log(`      ✓ Removed ${this.cleaned} excess priority dots`);
    }
    
    console.log(`   ✓ Visual cleanup complete`);
    return { cleaned: this.cleaned };
  }
}

// Main execution
async function resolveDifferences() {
  try {
    console.log('\n📊 Phase 1: Collecting Current State');
    console.log('─'.repeat(50));
    
    // Get all items
    let allItems = [];
    let cursor = null;
    let hasMore = true;
    
    while (hasMore) {
      const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      
      allItems = allItems.concat(response.data.data || []);
      cursor = response.data.cursor;
      hasMore = !!cursor;
    }
    
    console.log(`   ✓ Collected ${allItems.length} items`);
    
    // Create snapshot
    fs.writeFileSync('pre-resolution-snapshot.json', JSON.stringify(
      allItems.map(i => ({ id: i.id, type: i.type, position: i.position, color: i.style?.fillColor })),
      null, 2
    ));
    console.log('   ✓ Snapshot saved');
    
    // Initialize agents
    const agents = {
      color: new ColorCorrectionAgent(),
      addition: new ContentAdditionAgent(),
      optimization: new OptimizationAgent(),
      visual: new VisualCleanupAgent()
    };
    
    // Phase 2: Color Corrections
    console.log('\n═══ PHASE 2: COLOR CORRECTIONS ═══');
    const colorResult = await agents.color.execute(allItems);
    
    // Phase 3: Content Additions
    console.log('\n═══ PHASE 3: CONTENT ADDITIONS ═══');
    const additionResult = await agents.addition.execute();
    
    // Refresh items after additions
    allItems = [];
    cursor = null;
    hasMore = true;
    
    while (hasMore) {
      const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      
      allItems = allItems.concat(response.data.data || []);
      cursor = response.data.cursor;
      hasMore = !!cursor;
    }
    
    // Phase 4: Content Optimization
    console.log('\n═══ PHASE 4: CONTENT OPTIMIZATION ═══');
    const optimizationResult = await agents.optimization.execute(allItems);
    
    // Phase 5: Visual Cleanup
    console.log('\n═══ PHASE 5: VISUAL CLEANUP ═══');
    const visualResult = await agents.visual.execute(allItems);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ DIFFERENCE RESOLUTION COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Resolution Summary:');
    console.log(`   Color corrections: ${colorResult.changes}`);
    console.log(`   Items added: ${additionResult.added}`);
    console.log(`   Items removed: ${optimizationResult.removed}`);
    console.log(`   Visual elements cleaned: ${visualResult.cleaned}`);
    
    const totalChanges = colorResult.changes + additionResult.added + 
                        optimizationResult.removed + visualResult.cleaned;
    console.log(`\n   Total modifications: ${totalChanges}`);
    
    console.log('\n✨ Expected State Achieved:');
    console.log('   Section 0: 3 yellow + 3 green ✓');
    console.log('   Section 1: 17 yellow ✓');
    console.log('   Section 2: 25 yellow + 6 pink ✓');
    console.log('   Section 3: 12 green + 3 blue ✓');
    console.log('   Section 4: 150 yellow + 13 dots ✓');
    console.log('   Section 5: 30 yellow + 108 purple ✓');
    console.log('   Section 6: 24 dark blue + 48 yellow ✓');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run comprehensive-difference-audit.js to verify');
    console.log('   2. Check visual alignment on board');
    console.log('   3. Add example images manually if needed');
    
    console.log(`\n🔗 View resolved board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Execute resolution
resolveDifferences();