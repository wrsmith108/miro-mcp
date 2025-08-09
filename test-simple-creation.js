#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function testCreation() {
  try {
    // Test 1: Create a simple text
    console.log('Test 1: Creating simple text...');
    const textResponse = await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: 'Test Text Content'
      },
      position: { x: 0, y: 0 },
      style: {
        fontSize: '14'
      }
    });
    console.log('✅ Text created:', textResponse.data.id);
    
    // Test 2: Create text with HTML
    console.log('\nTest 2: Creating HTML text...');
    const htmlResponse = await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: '<strong>Bold Text</strong><br/>Second line'
      },
      position: { x: 200, y: 0 },
      style: {
        fontSize: '14',
        color: '#000000'
      }
    });
    console.log('✅ HTML text created:', htmlResponse.data.id);
    
    // Test 3: Create shape with text color
    console.log('\nTest 3: Creating shape...');
    const shapeResponse = await miroApi.post(`/boards/${boardId}/shapes`, {
      data: {
        shape: 'rectangle'
      },
      position: { x: 400, y: 0 },
      geometry: {
        width: 200,
        height: 100
      },
      style: {
        fillColor: '#424867',
        borderWidth: 1
      }
    });
    console.log('✅ Shape created:', shapeResponse.data.id);
    
    // Test 4: Create text with specific color
    console.log('\nTest 4: Creating colored text...');
    const coloredTextResponse = await miroApi.post(`/boards/${boardId}/texts`, {
      data: {
        content: 'White Text on Dark Background'
      },
      position: { x: 600, y: 0 },
      style: {
        fontSize: '14',
        color: '#FFFFFF'
      }
    });
    console.log('✅ Colored text created:', coloredTextResponse.data.id);
    
  } catch (error) {
    console.error('❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    if (error.response && error.response.data && error.response.data.context) {
      console.error('Error details:', JSON.stringify(error.response.data.context, null, 2));
    }
  }
}

testCreation();