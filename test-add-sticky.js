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

async function addStickyToUXUIFrame() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log(`Working with board ID: ${boardId}`);
    
    // First, get all items on the board to find the frame
    console.log('Fetching board items to find UX/UI requirements frame...');
    
    try {
      const response = await miroApi.get(`/boards/${boardId}/items`);
      const items = response.data.data;
      console.log(`Found ${items.length} items on the board`);
      
      // Find the frame or text item titled "UX/UI requirements"
      const frame = items.find(item => 
        item.type === 'frame' && 
        (item.data?.title === 'UX/UI requirements' || 
         item.data?.title?.toLowerCase().includes('ux/ui'))
      );
      
      // Also check text items for UX/UI requirements
      const uxuiText = items.find(item =>
        item.type === 'text' &&
        (item.data?.content?.includes('UX/UI') || 
         item.data?.content?.toLowerCase().includes('ux/ui requirements'))
      );
      
      // Log all text items to see what's on the board
      console.log('\nText items on the board:');
      items.filter(item => item.type === 'text').forEach(text => {
        console.log(`- Text: "${text.data?.content?.substring(0, 50)}..." at position (${text.position?.x}, ${text.position?.y})`);
      });
      
      if (frame) {
        console.log(`Found UX/UI requirements frame:`, {
          id: frame.id,
          title: frame.data?.title,
          position: frame.position,
          geometry: frame.geometry
        });
        
        // Calculate position for sticky note - center of the frame
        const stickyX = frame.position.x;
        const stickyY = frame.position.y;
        
        // Create sticky note using the generic items endpoint
        console.log(`Creating sticky note "Architecture" at frame position...`);
        const stickyResponse = await miroApi.post(`/boards/${boardId}/items`, {
          type: 'sticky_note',
          data: {
            content: 'Architecture',
            shape: 'square'
          },
          position: {
            x: stickyX,
            y: stickyY
          },
          style: {
            fillColor: 'yellow' // Yellow sticky note
          }
        });
        
        console.log(`✅ Successfully created sticky note with ID: ${stickyResponse.data.id}`);
        console.log(`Position: (${stickyX}, ${stickyY})`);
        
      } else if (uxuiText) {
        console.log(`Found UX/UI text item at position (${uxuiText.position?.x}, ${uxuiText.position?.y})`);
        
        // Create sticky note near the text
        const stickyX = (uxuiText.position?.x || 0) + 100;
        const stickyY = (uxuiText.position?.y || 0) + 100;
        
        console.log(`Creating sticky note "Architecture" near UX/UI text...`);
        const stickyResponse = await miroApi.post(`/boards/${boardId}/items`, {
          type: 'sticky_note',
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
          }
        });
        
        console.log(`✅ Successfully created sticky note with ID: ${stickyResponse.data.id}`);
        console.log(`Position: (${stickyX}, ${stickyY})`);
        
      } else {
        console.log('\nNo UX/UI requirements frame or text found.');
        console.log('Creating sticky note at position (100, 100) for visibility...');
        
        // Create sticky note at a visible position
        const stickyResponse = await miroApi.post(`/boards/${boardId}/items`, {
          type: 'sticky_note',
          data: {
            content: 'Architecture',
            shape: 'square'
          },
          position: {
            x: 100,
            y: 100
          },
          style: {
            fillColor: 'yellow'
          }
        });
        
        console.log(`✅ Successfully created sticky note with ID: ${stickyResponse.data.id}`);
        console.log(`Position: (100, 100)`);
      }
      
    } catch (itemsError) {
      console.log('Could not fetch items. Trying to create sticky note directly...');
      
      // Try using the specific sticky_notes endpoint
      const stickyResponse = await miroApi.post(`/boards/${boardId}/sticky_notes`, {
        data: {
          content: 'Architecture',
          shape: 'square'
        },
        position: {
          x: 0,
          y: 0
        },
        style: {
          fillColor: 'yellow',
          textAlign: 'center'
        },
        geometry: {
          width: 248
        }
      });
      
      console.log(`✅ Created sticky note with ID: ${stickyResponse.data.id}`);
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

addStickyToUXUIFrame();