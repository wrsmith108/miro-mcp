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

async function searchAllItems() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Searching board ID: ${boardId}\n`);
    
    // Get ALL items using pagination if needed
    let allItems = [];
    let cursor = null;
    let pageCount = 0;
    
    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);
      
      const params = { limit: 50 };
      if (cursor) params.cursor = cursor;
      
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      const items = response.data.data;
      allItems = allItems.concat(items);
      
      cursor = response.data.cursor;
    } while (cursor);
    
    console.log(`\nTotal items found: ${allItems.length}\n`);
    
    // Search for anything with UX/UI in the title or content
    console.log('Searching for UX/UI related items...\n');
    
    const uxuiItems = allItems.filter(item => {
      const title = item.data?.title || '';
      const content = item.data?.content || '';
      const text = item.data?.text || '';
      
      return title.toLowerCase().includes('ux') || 
             title.toLowerCase().includes('ui') ||
             content.toLowerCase().includes('ux') ||
             content.toLowerCase().includes('ui') ||
             text.toLowerCase().includes('ux') ||
             text.toLowerCase().includes('ui');
    });
    
    if (uxuiItems.length > 0) {
      console.log(`Found ${uxuiItems.length} items with UX/UI references:\n`);
      uxuiItems.forEach(item => {
        console.log(`Type: ${item.type}`);
        console.log(`ID: ${item.id}`);
        console.log(`Title: ${item.data?.title || 'N/A'}`);
        console.log(`Content: ${item.data?.content?.substring(0, 100) || 'N/A'}`);
        console.log(`Position: (${item.position?.x}, ${item.position?.y})`);
        if (item.geometry) {
          console.log(`Size: ${item.geometry.width} x ${item.geometry.height}`);
        }
        console.log('---');
      });
    } else {
      console.log('No items found with UX/UI references.');
    }
    
    // Also list all frames specifically
    console.log('\n=== ALL FRAMES ===\n');
    const frames = allItems.filter(item => item.type === 'frame');
    frames.forEach(frame => {
      console.log(`Frame: "${frame.data?.title || 'Untitled'}"`);
      console.log(`  ID: ${frame.id}`);
      console.log(`  Position: (${frame.position?.x}, ${frame.position?.y})`);
      console.log(`  Size: ${frame.geometry?.width} x ${frame.geometry?.height}`);
    });
    
    // Check if there's a frame we might have missed by checking raw data
    console.log('\n=== CHECKING RAW FRAME DATA ===\n');
    try {
      const framesResponse = await miroApi.get(`/boards/${boardId}/frames`);
      const directFrames = framesResponse.data.data;
      
      console.log(`Direct frames endpoint returned ${directFrames.length} frames\n`);
      
      directFrames.forEach(frame => {
        const title = frame.data?.title || frame.title || 'Untitled';
        console.log(`Frame: "${title}"`);
        if (title.toLowerCase().includes('ux') || title.toLowerCase().includes('ui')) {
          console.log('  ⭐ CONTAINS UX/UI!');
          console.log(`  Full data:`, JSON.stringify(frame, null, 2));
        }
      });
    } catch (err) {
      console.log('Could not fetch from frames endpoint directly');
    }
    
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

searchAllItems();