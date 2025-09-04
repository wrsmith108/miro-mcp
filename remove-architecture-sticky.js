#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${process.env.MIRO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function removeArchitectureSticky() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    const stickyId = '3458764638799653055';
    
    console.log(`Removing Architecture sticky note from UX/UI Requirements frame...`);
    console.log(`Sticky ID: ${stickyId}`);
    
    await miroApi.delete(`/boards/${boardId}/items/${stickyId}`);
    
    console.log(`\n✅ Successfully removed Architecture sticky note from UX/UI Requirements frame`);
    
  } catch (error) {
    console.error('Error removing sticky note:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

removeArchitectureSticky();