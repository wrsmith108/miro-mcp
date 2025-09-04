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

async function createUXUIFrameAndSticky() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Working with board ID: ${boardId}`);
    
    // Create the UX/UI Requirements frame
    // Position it after the last frame
    const frameX = 16000; // After frame 6
    const frameY = 1394;
    const frameWidth = 2000;
    const frameHeight = 3000;
    
    console.log('Creating UX/UI Requirements frame...');
    try {
      const frameResponse = await miroApi.post(`/boards/${boardId}/frames`, {
        data: {
          title: 'UX/UI Requirements',
          type: 'freeform'
        },
        position: {
          x: frameX,
          y: frameY
        },
        geometry: {
          width: frameWidth,
          height: frameHeight
        },
        style: {
          fillColor: 'transparent'
        }
      });
      
      console.log(`✅ Created UX/UI Requirements frame with ID: ${frameResponse.data.id}`);
      console.log(`Position: (${frameX}, ${frameY})`);
      
      // Now create the Architecture sticky note inside this frame
      const stickyX = frameX + 100; // Offset from frame origin
      const stickyY = frameY + 100;
      
      console.log('\nCreating "Architecture" sticky note inside the frame...');
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
      
    } catch (frameError) {
      console.log('Frame creation failed, it might already exist. Searching for existing frame...');
      
      // If frame creation fails, search again
      const framesResponse = await miroApi.get(`/boards/${boardId}/frames`);
      const frames = framesResponse.data.data;
      
      const uxuiFrame = frames.find(frame => 
        frame.data?.title?.includes('UX/UI')
      );
      
      if (uxuiFrame) {
        console.log(`Found existing UX/UI frame: ${uxuiFrame.data?.title}`);
        
        // Create sticky in existing frame
        const stickyX = uxuiFrame.position.x + 100;
        const stickyY = uxuiFrame.position.y + 100;
        
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
        
        console.log(`✅ Created sticky note in existing frame with ID: ${stickyResponse.data.id}`);
      }
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

createUXUIFrameAndSticky();