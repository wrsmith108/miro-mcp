#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Remove quotes from board ID if present
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');
const accessToken = process.env.MIRO_ACCESS_TOKEN;

console.log('Testing Miro API Connection...');
console.log('Board ID:', boardId);
console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT FOUND');

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function testMiroAPI() {
  try {
    // Test 1: Get board info
    console.log('\n📋 Getting board information...');
    const boardResponse = await miroApi.get(`/boards/${boardId}`);
    console.log('✅ Board Name:', boardResponse.data.name);
    console.log('   Board ID:', boardResponse.data.id);
    console.log('   View Link:', boardResponse.data.viewLink);
    
    // Test 2: Get board items
    console.log('\n📦 Getting board items...');
    const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
    const items = itemsResponse.data.data || [];
    
    console.log(`✅ Found ${items.length} items on the board`);
    
    if (items.length > 0) {
      console.log('\n📌 First few items:');
      items.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. Type: ${item.type}, ID: ${item.id}`);
        if (item.data && item.data.content) {
          console.log(`      Content: ${item.data.content.substring(0, 50)}...`);
        }
      });
    }
    
    // Test 3: Get all boards (to verify general access)
    console.log('\n📚 Getting all accessible boards...');
    const boardsResponse = await miroApi.get('/boards');
    const boards = boardsResponse.data.data || [];
    console.log(`✅ You have access to ${boards.length} board(s)`);
    
    console.log('\n✨ All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      console.error('   Authentication failed. Please check your access token.');
    } else if (error.response && error.response.status === 404) {
      console.error('   Board not found. Please check the board ID.');
    }
  }
}

testMiroAPI();