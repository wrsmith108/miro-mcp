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

async function removeTestStickies() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    
    // Test sticky IDs to remove
    const testStickyIds = [
      '3458764638806740995', // OST V2
      '3458764638806740996', // Ranked Assumption Tests
      '3458764638806741002', // Testing Prioritization
      '3458764638806741006', // Go/No-Go Decision
      '3458764638806741011', // Risk Mitigation
      '3458764638806741239'  // Success Metrics
    ];
    
    console.log('Removing test sticky notes...\n');
    
    for (const stickyId of testStickyIds) {
      try {
        await miroApi.delete(`/boards/${boardId}/items/${stickyId}`);
        console.log(`✅ Removed sticky: ${stickyId}`);
      } catch (error) {
        console.log(`⚠️  Could not remove sticky ${stickyId} - may already be deleted`);
      }
    }
    
    console.log('\n✅ All test stickies removed');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

removeTestStickies();