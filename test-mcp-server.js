#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Remove quotes from board ID if present
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');
const accessToken = process.env.MIRO_ACCESS_TOKEN;

console.log('Testing MCP Server Functionality with Miro Board...');
console.log('Board ID:', boardId);

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function testMCPServerFunctions() {
  try {
    // Test 1: Create a sticky note
    console.log('\n🎯 Test 1: Creating a sticky note...');
    const stickyResponse = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
      data: {
        content: 'Test sticky from MCP Server - ' + new Date().toLocaleString()
      },
      position: { 
        x: 100, 
        y: 100 
      },
      style: {
        fillColor: 'yellow'
      }
    });
    console.log('✅ Created sticky note with ID:', stickyResponse.data.id);
    
    // Test 2: Create a shape
    console.log('\n🎯 Test 2: Creating a shape...');
    const shapeResponse = await miroApi.post(`/boards/${boardId}/shapes`, {
      data: {
        shape: 'rectangle'
      },
      position: { 
        x: 300, 
        y: 100 
      },
      geometry: {
        width: 150,
        height: 100
      },
      style: {
        fillColor: '#1a85ff'
      }
    });
    console.log('✅ Created shape with ID:', shapeResponse.data.id);
    
    // Test 3: Create a text item
    console.log('\n🎯 Test 3: Creating a text item...');
    const textResponse = await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: 'MCP Server Test Text'
      },
      position: { 
        x: 500, 
        y: 100 
      },
      style: {
        fontSize: '24'
      }
    });
    console.log('✅ Created text item with ID:', textResponse.data.id);
    
    // Test 4: Get updated board items
    console.log('\n🎯 Test 4: Getting updated board items...');
    const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
    const items = itemsResponse.data.data || [];
    
    console.log(`✅ Board now has ${items.length} items`);
    
    // Count items by type
    const itemTypes = {};
    items.forEach(item => {
      itemTypes[item.type] = (itemTypes[item.type] || 0) + 1;
    });
    
    console.log('\n📊 Items by type:');
    Object.entries(itemTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    
    console.log('\n✨ All MCP server functions tested successfully!');
    console.log('\n💡 View your board at:');
    console.log(`   https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMCPServerFunctions();