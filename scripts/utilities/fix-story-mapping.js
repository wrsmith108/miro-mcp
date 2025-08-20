#!/usr/bin/env node

// Fix Story Mapping - Delete misplaced items and recreate in correct frame

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Configuration
const CONFIG = {
  BOARD_ID: 'uXjVJS1vI0k=',
  ACCESS_TOKEN: process.env.MIRO_ACCESS_TOKEN,
  RATE_LIMIT_DELAY: 100
};

// Miro API setup
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = {
  phase: (title) => console.log(`\n🎯 ${title}\n${'═'.repeat(50)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`)
};

// Delete misplaced items
async function deleteMisplacedItems() {
  log.phase('DELETING MISPLACED STORY MAP ITEMS');
  
  try {
    // Load the state file with misplaced item IDs
    const state = JSON.parse(fs.readFileSync('story-mapping-state.json', 'utf8'));
    
    // Collect all item IDs to delete
    const itemsToDelete = [
      ...state.journeyIds,
      ...state.activityIds,
      ...state.storyIds
    ].filter(id => id && typeof id === 'string');
    
    // Also need to delete any other stickies created (metrics, labels, etc.)
    // Get all items in the misplaced area and delete them
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?limit=100`);
    const allItems = response.data.data;
    
    // Filter items that are in the wrong area (around position 9756, 1394)
    const wrongAreaItems = allItems.filter(item => {
      if (!item.position) return false;
      const dx = Math.abs(item.position.x - 9756);
      const dy = Math.abs(item.position.y - 1394);
      // Items within 2000 units of the wrong position
      return dx < 2000 && dy < 2000 && item.type === 'sticky_note';
    });
    
    log.info(`Found ${itemsToDelete.length} tracked items to delete`);
    log.info(`Found ${wrongAreaItems.length} items in wrong area`);
    
    // Delete tracked items
    let deletedCount = 0;
    for (const itemId of itemsToDelete) {
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${itemId}`);
        deletedCount++;
        if (deletedCount % 10 === 0) {
          log.info(`Deleted ${deletedCount} items...`);
        }
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (err) {
        // Item might already be deleted or invalid ID
      }
    }
    
    // Delete additional items in wrong area
    for (const item of wrongAreaItems) {
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${item.id}`);
        deletedCount++;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (err) {
        // Continue if delete fails
      }
    }
    
    log.success(`Deleted ${deletedCount} misplaced items`);
    return true;
  } catch (error) {
    log.error(`Failed to delete items: ${error.message}`);
    return false;
  }
}

// Find the correct Galaxy Solution Story Mapping frame
async function findCorrectFrame() {
  log.phase('FINDING CORRECT GALAXY SOLUTION STORY MAPPING FRAME');
  
  try {
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/items?type=frame&limit=50`);
    const frames = response.data.data;
    
    // Find frame with exact title
    const correctFrame = frames.find(frame => 
      frame.data && 
      frame.data.title && 
      frame.data.title === 'Galaxy Solution Story Mapping'
    );
    
    if (correctFrame) {
      log.success(`Found correct frame at position (${correctFrame.position.x}, ${correctFrame.position.y})`);
      log.info(`Frame ID: ${correctFrame.id}`);
      log.info(`Frame size: ${correctFrame.geometry.width} x ${correctFrame.geometry.height}`);
      
      // Save correct frame info
      const correctFrameInfo = {
        frameId: correctFrame.id,
        position: correctFrame.position,
        geometry: correctFrame.geometry,
        title: correctFrame.data.title
      };
      
      fs.writeFileSync('correct-frame-info.json', JSON.stringify(correctFrameInfo, null, 2));
      log.info('Saved correct frame info to correct-frame-info.json');
      
      return correctFrame;
    } else {
      log.error('Galaxy Solution Story Mapping frame not found');
      
      // List all frames to help debug
      log.info('Available frames:');
      frames.forEach(frame => {
        if (frame.data && frame.data.title) {
          console.log(`   - "${frame.data.title}" at (${frame.position.x}, ${frame.position.y})`);
        }
      });
      
      return null;
    }
  } catch (error) {
    log.error(`Failed to find frame: ${error.message}`);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🔧 Fixing Story Mapping Placement');
  console.log('📊 Will delete misplaced items and recreate in correct frame');
  console.log('');
  
  // Step 1: Delete misplaced items
  const deleted = await deleteMisplacedItems();
  if (!deleted) {
    log.error('Failed to delete misplaced items');
  }
  
  // Step 2: Find the correct frame
  const correctFrame = await findCorrectFrame();
  if (!correctFrame) {
    log.error('Cannot proceed without finding correct frame');
    return;
  }
  
  // Step 3: Update the solution-story-mapping.js to use correct frame position
  log.phase('NEXT STEPS');
  console.log('✅ Misplaced items have been deleted');
  console.log('✅ Correct frame location identified');
  console.log('');
  console.log('📍 Correct frame position:');
  console.log(`   X: ${correctFrame.position.x}`);
  console.log(`   Y: ${correctFrame.position.y}`);
  console.log('');
  console.log('🔄 Now re-running story mapping with correct position...');
  console.log('');
  
  // Step 4: Re-run the story mapping with corrected position
  // We'll modify the solution-story-mapping.js to use the actual frame position
  const { exec } = require('child_process');
  
  // Set environment variable with correct frame position
  process.env.CORRECT_FRAME_X = correctFrame.position.x;
  process.env.CORRECT_FRAME_Y = correctFrame.position.y;
  
  exec('node solution-story-mapping-fixed.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(stdout);
    if (stderr) console.error(stderr);
  });
}

if (require.main === module) {
  main().catch(console.error);
}