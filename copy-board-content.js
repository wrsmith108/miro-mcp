#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const sourceBoardId = 'uXjVPmGTnek=';
const destBoardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('🔄 Miro Board Content Copy Tool');
console.log('Source Board:', sourceBoardId);
console.log('Destination Board:', destBoardId);
console.log('─'.repeat(50));

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

async function copyBoardContent() {
  try {
    // Step 1: Get source board info
    console.log('\n📋 Getting source board information...');
    try {
      const sourceBoardResponse = await miroApi.get(`/boards/${sourceBoardId}`);
      console.log('✅ Source Board Name:', sourceBoardResponse.data.name);
    } catch (error) {
      console.log('⚠️  Could not get source board info (may need access)');
    }
    
    // Step 2: Get all items from source board
    console.log('\n📦 Getting items from source board...');
    const itemsResponse = await miroApi.get(`/boards/${sourceBoardId}/items`);
    const sourceItems = itemsResponse.data.data || [];
    
    console.log(`✅ Found ${sourceItems.length} items to copy`);
    
    if (sourceItems.length === 0) {
      console.log('No items to copy.');
      return;
    }
    
    // Group items by type
    const itemsByType = {};
    sourceItems.forEach(item => {
      if (!itemsByType[item.type]) {
        itemsByType[item.type] = [];
      }
      itemsByType[item.type].push(item);
    });
    
    console.log('\n📊 Items breakdown:');
    Object.entries(itemsByType).forEach(([type, items]) => {
      console.log(`   - ${type}: ${items.length} items`);
    });
    
    // Step 3: Copy each item to destination board
    console.log('\n🚀 Starting copy process...');
    let successCount = 0;
    let failCount = 0;
    
    for (const item of sourceItems) {
      try {
        switch (item.type) {
          case 'sticky_note':
            await copyStickyNote(item);
            successCount++;
            break;
            
          case 'shape':
            await copyShape(item);
            successCount++;
            break;
            
          case 'text':
            await copyText(item);
            successCount++;
            break;
            
          case 'card':
            await copyCard(item);
            successCount++;
            break;
            
          case 'app_card':
            await copyAppCard(item);
            successCount++;
            break;
            
          case 'frame':
            await copyFrame(item);
            successCount++;
            break;
            
          default:
            console.log(`   ⚠️  Skipped unsupported type: ${item.type}`);
            failCount++;
        }
      } catch (error) {
        console.log(`   ❌ Failed to copy ${item.type}: ${error.message}`);
        failCount++;
      }
    }
    
    // Step 4: Summary
    console.log('\n' + '─'.repeat(50));
    console.log('📊 Copy Summary:');
    console.log(`   ✅ Successfully copied: ${successCount} items`);
    console.log(`   ❌ Failed/Skipped: ${failCount} items`);
    console.log(`\n🎉 Board copy complete!`);
    console.log(`\n💡 View your destination board at:`);
    console.log(`   https://miro.com/app/board/${destBoardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 403) {
      console.error('   You may not have access to the source board.');
    }
  }
}

async function copyStickyNote(item) {
  console.log(`   📝 Copying sticky note...`);
  const payload = {
    data: {
      content: item.data?.content || 'Copied sticky note'
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  if (item.style) {
    payload.style = {
      fillColor: item.style.fillColor || 'yellow'
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/sticky_notes`, payload);
}

async function copyShape(item) {
  console.log(`   🔷 Copying shape (${item.data?.shape || 'rectangle'})...`);
  const payload = {
    data: {
      shape: item.data?.shape || 'rectangle'
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  if (item.geometry) {
    payload.geometry = {
      width: item.geometry.width || 100,
      height: item.geometry.height || 100
    };
  }
  
  if (item.style) {
    payload.style = {
      fillColor: item.style.fillColor || '#1a85ff'
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/shapes`, payload);
}

async function copyText(item) {
  console.log(`   📄 Copying text...`);
  const payload = {
    data: {
      content: item.data?.content || 'Copied text'
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  if (item.style) {
    payload.style = {
      fontSize: item.style.fontSize || '14',
      color: item.style.color || '#000000'
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/texts`, payload);
}

async function copyCard(item) {
  console.log(`   🃏 Copying card...`);
  const payload = {
    data: {
      title: item.data?.title || 'Copied card',
      description: item.data?.description || ''
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  if (item.style) {
    payload.style = {
      cardTheme: item.style.cardTheme || '#2d9bf0'
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/cards`, payload);
}

async function copyAppCard(item) {
  console.log(`   📱 Copying app card...`);
  // App cards are special and may need different handling
  // For now, convert to regular card
  const payload = {
    data: {
      title: item.data?.title || 'App Card',
      description: item.data?.description || ''
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/cards`, payload);
}

async function copyFrame(item) {
  console.log(`   🖼️ Copying frame...`);
  const payload = {
    data: {
      title: item.data?.title || 'Copied frame',
      type: item.data?.type || 'freeform'
    }
  };
  
  if (item.position) {
    payload.position = {
      x: item.position.x,
      y: item.position.y
    };
  }
  
  if (item.geometry) {
    payload.geometry = {
      width: item.geometry.width || 800,
      height: item.geometry.height || 600
    };
  }
  
  if (item.style) {
    payload.style = {
      fillColor: item.style.fillColor || '#ffffff'
    };
  }
  
  await miroApi.post(`/boards/${destBoardId}/frames`, payload);
}

// Run the copy process
copyBoardContent();