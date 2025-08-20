#!/usr/bin/env node

// Delete misplaced sticky notes from wrong location

const axios = require('axios');
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

// IDs of misplaced items from the original placement
const MISPLACED_ITEM_IDS = [
  // Journey IDs
  "3458764637790927935",
  "3458764637790927975",
  "3458764637790927995",
  "3458764637790928022",
  "3458764637790928055",
  "3458764637790928080",
  // Activity IDs
  "3458764637790927941",
  "3458764637790927958",
  "3458764637790927963",
  "3458764637790927982",
  "3458764637790927984",
  "3458764637790927988",
  "3458764637790928000",
  "3458764637790928002",
  "3458764637790928007",
  "3458764637790928028",
  "3458764637790928041",
  "3458764637790928050",
  "3458764637790928056",
  "3458764637790928060",
  "3458764637790928065",
  "3458764637790928089",
  "3458764637790928096",
  "3458764637790928100",
  // Story IDs
  "3458764637790928107",
  "3458764637790928120",
  "3458764637790928131",
  "3458764637790928147",
  "3458764637790928159",
  "3458764637790928163",
  "3458764637790928168",
  "3458764637790928171",
  "3458764637790928174",
  "3458764637790928175",
  "3458764637790928178",
  "3458764637790928181",
  "3458764637790928188",
  "3458764637790928194",
  "3458764637790928209",
  "3458764637790928226",
  "3458764637790928239",
  "3458764637790928244",
  "3458764637790928250",
  "3458764637790928256",
  "3458764637790928261",
  "3458764637790928266",
  "3458764637790928268",
  "3458764637790928275",
  "3458764637790928285",
  "3458764637790928290",
  "3458764637790928295",
  "3458764637790928302",
  "3458764637790928307",
  "3458764637790928317",
  "3458764637790928329",
  "3458764637790928336",
  "3458764637790928339",
  "3458764637790928348",
  "3458764637790928356",
  "3458764637790928369",
  "3458764637790928388",
  "3458764637790928392",
  "3458764637790928396",
  "3458764637790928397",
  "3458764637790928415",
  "3458764637790928426",
  "3458764637790928434",
  "3458764637790928438",
  "3458764637790928442",
  "3458764637790928446",
  "3458764637790928463",
  "3458764637790928468",
  "3458764637790928479",
  "3458764637790928494",
  "3458764637790928501",
  "3458764637790928519",
  "3458764637790928544"
];

// Delete items one by one
async function deleteMisplacedItems() {
  log.phase('DELETING MISPLACED STICKY NOTES');
  
  let deletedCount = 0;
  let failedCount = 0;
  
  for (const itemId of MISPLACED_ITEM_IDS) {
    try {
      await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/sticky_notes/${itemId}`);
      deletedCount++;
      
      if (deletedCount % 10 === 0) {
        log.info(`Deleted ${deletedCount} items...`);
      }
      
      await sleep(CONFIG.RATE_LIMIT_DELAY);
    } catch (error) {
      // Try generic item endpoint if sticky_note specific fails
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/items/${itemId}`);
        deletedCount++;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (err) {
        failedCount++;
        // Item may already be deleted or ID invalid
      }
    }
  }
  
  log.success(`Successfully deleted ${deletedCount} items`);
  if (failedCount > 0) {
    log.info(`${failedCount} items could not be deleted (may already be removed)`);
  }
  
  return { deletedCount, failedCount };
}

// Also search for any stickies in the wrong area
async function findAndDeleteMisplacedItems() {
  log.phase('SEARCHING FOR ADDITIONAL MISPLACED ITEMS');
  
  try {
    // Get all sticky notes
    const response = await miroApi.get(`/boards/${CONFIG.BOARD_ID}/sticky_notes?limit=100`);
    const stickies = response.data.data;
    
    // Find stickies in the wrong area (around position 9756, 1394)
    const misplacedStickies = stickies.filter(sticky => {
      if (!sticky.position) return false;
      const dx = Math.abs(sticky.position.x - 9756);
      const dy = Math.abs(sticky.position.y - 1394);
      // Items within 2500 units of the wrong position
      return dx < 2500 && dy < 2500;
    });
    
    log.info(`Found ${misplacedStickies.length} additional stickies in wrong area`);
    
    let additionalDeleted = 0;
    for (const sticky of misplacedStickies) {
      try {
        await miroApi.delete(`/boards/${CONFIG.BOARD_ID}/sticky_notes/${sticky.id}`);
        additionalDeleted++;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (err) {
        // Continue if delete fails
      }
    }
    
    if (additionalDeleted > 0) {
      log.success(`Deleted ${additionalDeleted} additional misplaced stickies`);
    }
    
    return additionalDeleted;
  } catch (error) {
    log.error(`Failed to search for additional items: ${error.message}`);
    return 0;
  }
}

// Main execution
async function main() {
  console.log('🧹 Cleaning up misplaced sticky notes');
  console.log('📍 Target area: around position (9756, 1394)');
  console.log('');
  
  // Delete known misplaced items
  const { deletedCount, failedCount } = await deleteMisplacedItems();
  
  // Search for and delete any additional misplaced items
  const additionalDeleted = await findAndDeleteMisplacedItems();
  
  // Final report
  log.phase('CLEANUP COMPLETE');
  console.log(`✅ Total items deleted: ${deletedCount + additionalDeleted}`);
  console.log(`📍 The correct story map is in the Galaxy Solution Story Mapping frame`);
  console.log(`🔗 View your board: https://miro.com/app/board/uXjVJS1vI0k=/`);
}

if (require.main === module) {
  main().catch(console.error);
}