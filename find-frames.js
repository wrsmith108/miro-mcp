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

async function findFramesAndFixSticky() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Working with board ID: ${boardId}`);
    
    // First, delete the incorrectly placed sticky note
    const stickyIdToDelete = '3458764638794476236';
    try {
      await miroApi.delete(`/boards/${boardId}/items/${stickyIdToDelete}`);
      console.log(`✅ Deleted incorrectly placed sticky note: ${stickyIdToDelete}`);
    } catch (deleteError) {
      console.log(`Note: Could not delete sticky ${stickyIdToDelete} - it may already be deleted`);
    }
    
    // Get all items on the board - try different endpoints
    console.log('\nSearching for frames on the board...');
    
    // Try the specific frames endpoint
    try {
      const framesResponse = await miroApi.get(`/boards/${boardId}/frames`);
      const frames = framesResponse.data.data;
      console.log(`\nFound ${frames.length} frames:`);
      
      frames.forEach(frame => {
        console.log(`- Frame: "${frame.data?.title || 'Untitled'}" (ID: ${frame.id})`);
        console.log(`  Position: (${frame.position?.x}, ${frame.position?.y})`);
        console.log(`  Size: ${frame.geometry?.width} x ${frame.geometry?.height}`);
      });
      
      // Find the UX/UI Requirements frame
      const uxuiFrame = frames.find(frame => 
        frame.data?.title === 'UX/UI Requirements' || 
        frame.data?.title?.includes('UX/UI')
      );
      
      if (uxuiFrame) {
        console.log(`\n✅ Found UX/UI Requirements frame!`);
        console.log(`Frame ID: ${uxuiFrame.id}`);
        console.log(`Position: (${uxuiFrame.position?.x}, ${uxuiFrame.position?.y})`);
        
        // Create sticky note in the correct frame
        const stickyX = uxuiFrame.position.x + 50; // Offset slightly from frame origin
        const stickyY = uxuiFrame.position.y + 50;
        
        console.log(`\nCreating "Architecture" sticky note in UX/UI Requirements frame...`);
        const stickyResponse = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: {
            content: 'Architecture',
            shape: 'square'
          },
          position: {
            x: stickyX,
            y: stickyY
          },
          style: {
            fillColor: 'yellow'
          },
          geometry: {
            width: 248
          }
        });
        
        console.log(`✅ Successfully created sticky note with ID: ${stickyResponse.data.id}`);
        console.log(`Position: (${stickyX}, ${stickyY}) inside UX/UI Requirements frame`);
      } else {
        console.log('\n⚠️ UX/UI Requirements frame not found in frames list');
      }
      
    } catch (framesError) {
      console.log('Could not fetch frames directly, trying items endpoint...');
      
      // Fallback to items endpoint
      const itemsResponse = await miroApi.get(`/boards/${boardId}/items`);
      const items = itemsResponse.data.data;
      
      console.log(`\nAll items (${items.length} total):`);
      items.forEach(item => {
        if (item.type === 'frame' || item.data?.title?.includes('UX/UI') || item.data?.content?.includes('UX/UI')) {
          console.log(`- ${item.type}: "${item.data?.title || item.data?.content || 'No title'}" at (${item.position?.x}, ${item.position?.y})`);
        }
      });
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

findFramesAndFixSticky();