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

async function addSuccessMetricsSticky() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    
    // Get all frames
    const response = await miroApi.get(`/boards/${boardId}/frames`, { 
      params: { limit: 50 } 
    });
    const frames = response.data.data;
    
    // Look for Success Metrics frame or the Copy of Risk Mitigation
    let targetFrame = frames.find(f => {
      const title = f.data?.title || '';
      return title.toLowerCase().includes('success') && title.toLowerCase().includes('metrics') ||
             title.toLowerCase().includes('tracking') ||
             title === 'Copy of Risk Mitigation';
    });
    
    if (!targetFrame) {
      // Use the "Copy of Risk Mitigation" frame as fallback
      targetFrame = frames.find(f => f.id === '3458764638806506858');
    }
    
    if (targetFrame) {
      console.log(`Found frame: "${targetFrame.data?.title}"`);
      console.log(`ID: ${targetFrame.id}`);
      console.log(`Position: (${targetFrame.position?.x}, ${targetFrame.position?.y})\n`);
      
      // Create sticky note
      const stickyX = targetFrame.position.x + 150;
      const stickyY = targetFrame.position.y + 150;
      
      const stickyResponse = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: {
          content: 'Test: Success Metrics & Tracking',
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
      
      console.log(`✅ Created sticky in "${targetFrame.data?.title}"`);
      console.log(`   Sticky ID: ${stickyResponse.data.id}`);
      console.log(`   Position: (${stickyX}, ${stickyY})`);
      
    } else {
      console.log('❌ Could not find Success Metrics & Tracking frame');
      console.log('\nAll available frames:');
      frames.forEach(f => {
        console.log(`- "${f.data?.title}" (ID: ${f.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

addSuccessMetricsSticky();