#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔍 Checking Remaining Board Items');
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

async function checkRemaining() {
  try {
    const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
    const items = itemsResponse.data.data || [];
    
    console.log(`\n📦 Found ${items.length} items on board:\n`);
    
    if (items.length === 0) {
      console.log('✅ Board is completely empty!');
      return;
    }
    
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Type: ${item.type}`);
      console.log(`  ID: ${item.id}`);
      if (item.data?.content) {
        console.log(`  Content: ${item.data.content.substring(0, 50)}...`);
      }
      if (item.data?.title) {
        console.log(`  Title: ${item.data.title}`);
      }
      console.log('');
    });
    
    // Try to delete remaining items with force
    console.log('🗑️  Attempting to delete remaining items...\n');
    
    for (const item of items) {
      try {
        // Try generic items endpoint first
        await miroApi.delete(`/boards/${boardId}/items/${item.id}`);
        console.log(`✅ Deleted ${item.type} (${item.id})`);
      } catch (error) {
        // If generic fails, try specific endpoint
        try {
          let endpoint = `/boards/${boardId}/`;
          switch (item.type) {
            case 'frame':
              endpoint += `frames/${item.id}`;
              break;
            case 'connector':
              endpoint += `connectors/${item.id}`;
              break;
            case 'line':
              endpoint += `lines/${item.id}`;
              break;
            default:
              throw new Error('Unknown type');
          }
          await miroApi.delete(endpoint);
          console.log(`✅ Deleted ${item.type} (${item.id})`);
        } catch (innerError) {
          console.log(`❌ Could not delete ${item.type} (${item.id}) - may be locked or system item`);
        }
      }
    }
    
    // Final check
    console.log('\n' + '─'.repeat(50));
    console.log('📋 Final verification...');
    const finalResponse = await miroApi.get(`/boards/${boardId}/items`);
    const finalItems = finalResponse.data.data || [];
    
    if (finalItems.length === 0) {
      console.log('✅ SUCCESS! Board is now completely empty.');
    } else {
      console.log(`⚠️  ${finalItems.length} items remain (may be system items or frames).`);
      finalItems.forEach(item => {
        console.log(`   - ${item.type}: ${item.id}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

checkRemaining();