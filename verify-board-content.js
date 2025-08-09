#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('📋 Verifying Board Content');
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

async function verifyBoardContent() {
  try {
    // Get board info
    console.log('\n📋 Board Information:');
    const boardResponse = await miroApi.get(`/boards/${boardId}`);
    console.log('   Name:', boardResponse.data.name);
    console.log('   View Link:', boardResponse.data.viewLink);
    
    // Get all items
    console.log('\n📦 Board Items:');
    const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
    const items = itemsResponse.data.data || [];
    
    console.log(`   Total items: ${items.length}`);
    
    // Group by type
    const itemsByType = {};
    items.forEach(item => {
      if (!itemsByType[item.type]) {
        itemsByType[item.type] = [];
      }
      itemsByType[item.type].push(item);
    });
    
    console.log('\n📊 Items by Type:');
    Object.entries(itemsByType).forEach(([type, typeItems]) => {
      console.log(`   - ${type}: ${typeItems.length} items`);
    });
    
    // Show text content
    if (itemsByType.text && itemsByType.text.length > 0) {
      console.log('\n📄 Text Items Content:');
      itemsByType.text.forEach((item, index) => {
        const content = item.data?.content || '(empty)';
        const preview = content.length > 60 ? content.substring(0, 60) + '...' : content;
        console.log(`   ${index + 1}. "${preview}"`);
      });
    }
    
    // Show sticky notes
    if (itemsByType.sticky_note && itemsByType.sticky_note.length > 0) {
      console.log('\n📝 Sticky Notes:');
      itemsByType.sticky_note.forEach((item, index) => {
        const content = item.data?.content || '(empty)';
        const preview = content.length > 60 ? content.substring(0, 60) + '...' : content;
        console.log(`   ${index + 1}. "${preview}"`);
      });
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Verification complete!');
    console.log(`\n💡 View your board at:`);
    console.log(`   https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
  }
}

verifyBoardContent();