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

async function findAllFrames() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Working with board ID: ${boardId}\n`);
    
    // Get ALL frames using pagination
    let allFrames = [];
    let cursor = null;
    let pageCount = 0;
    
    console.log('Fetching all frames with pagination...\n');
    
    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);
      
      const params = { limit: 50 };
      if (cursor) params.cursor = cursor;
      
      const response = await miroApi.get(`/boards/${boardId}/frames`, { params });
      const frames = response.data.data;
      allFrames = allFrames.concat(frames);
      
      console.log(`  Found ${frames.length} frames on this page`);
      
      cursor = response.data.cursor;
    } while (cursor);
    
    console.log(`\nTotal frames found: ${allFrames.length}\n`);
    
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
    console.log('--- Searching for target frames ---\n');
    for (const targetName of targetFrames) {
      const frame = allFrames.find(f => {
        const title = f.data?.title || '';
        // More flexible matching
        const cleanTitle = title.replace(/&amp;/g, '&').replace(/[^\w\s]/g, '').toLowerCase();
        const cleanTarget = targetName.replace(/[^\w\s]/g, '').toLowerCase();
        
        return cleanTitle.includes(cleanTarget) || 
               title.toLowerCase().includes(targetName.toLowerCase());
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
        console.log(`   Position: (${frame.position?.x?.toFixed(0)}, ${frame.position?.y?.toFixed(0)})`);
        console.log(`   Size: ${frame.geometry?.width?.toFixed(0)} x ${frame.geometry?.height?.toFixed(0)}\n`);
      } else {
        console.log(`❌ Not found: "${targetName}"\n`);
      }
    }
    
    // Create sticky notes in each found frame
    if (foundFrames.length > 0) {
      console.log('\n--- Creating sticky notes in found frames ---\n');
      
      for (const frame of foundFrames) {
        try {
          // Position sticky note near the top-left of the frame
          const stickyX = frame.position.x + 150;
          const stickyY = frame.position.y + 150;
          
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
              fillColor: 'light_green'
            },
            geometry: {
              width: 248
            }
          });
          
          console.log(`✅ Created sticky in "${frame.title}"`);
          console.log(`   Sticky ID: ${stickyResponse.data.id}`);
          console.log(`   Position: (${stickyX.toFixed(0)}, ${stickyY.toFixed(0)})\n`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (stickyError) {
          console.error(`❌ Failed to create sticky in "${frame.title}":`, stickyError.response?.data?.message || stickyError.message);
        }
      }
    }
    
    // List all frames for reference
    console.log('\n--- All frames on board ---\n');
    allFrames.forEach((frame, index) => {
      const y = frame.position?.y || 0;
      console.log(`${index + 1}. "${frame.data?.title}" - Y: ${y.toFixed(0)} - ID: ${frame.id}`);
    });
    
    // Group frames by Y position to identify rows
    console.log('\n--- Frames grouped by row (Y position) ---\n');
    const rows = {};
    allFrames.forEach(frame => {
      const y = Math.round((frame.position?.y || 0) / 1000) * 1000; // Round to nearest 1000
      if (!rows[y]) rows[y] = [];
      rows[y].push(frame.data?.title);
    });
    
    Object.keys(rows).sort((a, b) => a - b).forEach(y => {
      console.log(`Row at Y ~${y}:`);
      rows[y].forEach(title => console.log(`  - ${title}`));
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

findAllFrames();