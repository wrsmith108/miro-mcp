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

async function addArchitectureSticky() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    
    // UX/UI Requirements frame details
    const frameId = '3458764638794015919';
    const frameX = 3661.490243569511;
    const frameY = 18267.379098828635;
    const frameWidth = 7988.8433392170255;
    const frameHeight = 4493.724378309576;
    
    // Position the sticky note in the upper left area of the frame
    const stickyX = frameX + 200; // 200 pixels from left edge
    const stickyY = frameY + 200; // 200 pixels from top edge
    
    console.log(`Creating "Architecture" sticky note in UX/UI Requirements frame...`);
    console.log(`Frame position: (${frameX}, ${frameY})`);
    console.log(`Sticky position: (${stickyX}, ${stickyY})`);
    
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
    
    console.log(`\n✅ Successfully created sticky note!`);
    console.log(`Sticky ID: ${stickyResponse.data.id}`);
    console.log(`Position: (${stickyX}, ${stickyY})`);
    console.log(`Located in: UX/UI Requirements frame (ID: ${frameId})`);
    
  } catch (error) {
    console.error('Error creating sticky note:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

addArchitectureSticky();