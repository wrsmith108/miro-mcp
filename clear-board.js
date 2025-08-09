#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🗑️  Miro Board Cleanup Tool');
console.log('Board ID:', boardId);
console.log('─'.repeat(50));

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function clearBoard() {
  try {
    // Step 1: Get all items from the board
    console.log('\n📦 Getting all items from board...');
    const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
    const items = itemsResponse.data.data || [];
    
    console.log(`Found ${items.length} items to delete`);
    
    if (items.length === 0) {
      console.log('✅ Board is already empty!');
      return;
    }
    
    // Show breakdown by type
    const itemsByType = {};
    items.forEach(item => {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
    });
    
    console.log('\n📊 Items to delete:');
    Object.entries(itemsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    
    // Step 2: Delete each item
    console.log('\n🗑️  Deleting items...');
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const item of items) {
      try {
        // Use the correct endpoint for each item type
        let deleteEndpoint = `/boards/${boardId}/`;
        
        switch (item.type) {
          case 'sticky_note':
            deleteEndpoint += `sticky_notes/${item.id}`;
            break;
          case 'shape':
            deleteEndpoint += `shapes/${item.id}`;
            break;
          case 'text':
            deleteEndpoint += `texts/${item.id}`;
            break;
          case 'card':
            deleteEndpoint += `cards/${item.id}`;
            break;
          case 'frame':
            deleteEndpoint += `frames/${item.id}`;
            break;
          case 'image':
            deleteEndpoint += `images/${item.id}`;
            break;
          default:
            // Try generic items endpoint for unknown types
            deleteEndpoint += `items/${item.id}`;
        }
        
        await miroApi.delete(deleteEndpoint);
        deletedCount++;
        process.stdout.write(`\r   Deleted ${deletedCount}/${items.length} items...`);
      } catch (error) {
        failedCount++;
        // Silently continue, will report at the end
      }
    }
    
    console.log('\n');
    
    // Step 3: Verify board is empty
    console.log('\n✅ Verifying board is empty...');
    const verifyResponse = await miroApi.get(`/boards/${boardId}/items`);
    const remainingItems = verifyResponse.data.data || [];
    
    console.log('─'.repeat(50));
    if (remainingItems.length === 0) {
      console.log('🎉 Success! Board is completely empty.');
    } else {
      console.log(`⚠️  ${remainingItems.length} items could not be deleted.`);
      console.log('   These may be locked or system items.');
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Deleted: ${deletedCount} items`);
    if (failedCount > 0) {
      console.log(`   ❌ Failed: ${failedCount} items`);
    }
    console.log(`   📋 Remaining: ${remainingItems.length} items`);
    
    console.log(`\n💡 View your board at:`);
    console.log(`   https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run the cleanup
clearBoard();