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

async function findNewFramesAndAddStickies() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Working with board ID: ${boardId}\n`);
    
    // Get all frames on the board
    console.log('Searching for frames on the board...');
    const framesResponse = await miroApi.get(`/boards/${boardId}/frames`);
    const frames = framesResponse.data.data;
    
    console.log(`Found ${frames.length} frames total\n`);
    
    // Target frames to find
    const targetFrames = [
      'OST V2',
      'Ranked Assumption Tests',
      'Testing Prioritization and Sequencing',
      'Go/No-Go Decision Criteria',
      'Risk mitigation',
      'Success Metrics & Tracking'
    ];
    
    const foundFrames = [];
    
    // Search for each target frame
    for (const targetName of targetFrames) {
      const frame = frames.find(f => {
        const title = f.data?.title || '';
        // Case-insensitive partial match
        return title.toLowerCase().includes(targetName.toLowerCase()) ||
               title.replace(/&amp;/g, '&').toLowerCase().includes(targetName.toLowerCase());
      });
      
      if (frame) {
        foundFrames.push({
          name: targetName,
          id: frame.id,
          title: frame.data?.title,
          position: frame.position,
          geometry: frame.geometry
        });
        console.log(`✅ Found frame: "${frame.data?.title}"`);
        console.log(`   ID: ${frame.id}`);
        console.log(`   Position: (${frame.position?.x}, ${frame.position?.y})\n`);
      } else {
        console.log(`❌ Not found: "${targetName}"\n`);
      }
    }
    
    // Create sticky notes in each found frame
    console.log('\n--- Creating sticky notes in found frames ---\n');
    
    for (const frame of foundFrames) {
      try {
        // Position sticky note near the top-left of the frame
        const stickyX = frame.position.x + 100;
        const stickyY = frame.position.y + 100;
        
        const stickyResponse = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
          data: {
            content: `Test: ${frame.name}`,
            shape: 'square'
          },
          position: {
            x: stickyX,
            y: stickyY
          },
          style: {
            fillColor: 'light_yellow'
          },
          geometry: {
            width: 248
          }
        });
        
        console.log(`✅ Created sticky in "${frame.title}"`);
        console.log(`   Sticky ID: ${stickyResponse.data.id}`);
        console.log(`   Position: (${stickyX}, ${stickyY})\n`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (stickyError) {
        console.error(`❌ Failed to create sticky in "${frame.title}":`, stickyError.response?.data?.message || stickyError.message);
      }
    }
    
    // List all frames for reference
    console.log('\n--- All frames on board (for reference) ---\n');
    frames.forEach(frame => {
      console.log(`"${frame.data?.title}" - ID: ${frame.id}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

findNewFramesAndAddStickies();