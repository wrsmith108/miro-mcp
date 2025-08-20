#!/usr/bin/env node

// Test script to validate Teresa Torres implementation
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BOARD_ID = 'uXjVJS1vI0k=';
const ACCESS_TOKEN = process.env.MIRO_ACCESS_TOKEN;

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testConnection() {
  console.log('🧪 Testing Miro API connection...');
  
  try {
    // First, try to list all boards to verify token works
    console.log('📋 Testing board listing...');
    const boardsResponse = await miroApi.get('/boards');
    console.log('✅ Token is valid!');
    console.log(`Found ${boardsResponse.data.data.length} accessible boards:`);
    
    boardsResponse.data.data.forEach(board => {
      console.log(`   - "${board.name}" (ID: ${board.id})`);
      if (board.id === BOARD_ID) {
        console.log('     👆 This is our target board!');
      }
    });
    
    // Now try to access the specific board
    console.log(`\n📊 Accessing board ${BOARD_ID}...`);
    const response = await miroApi.get(`/boards/${BOARD_ID}/items?limit=5`);
    console.log('✅ Board access successful!');
    console.log(`📊 Found ${response.data.data.length} items (showing first 5)`);
    
    // Look for PRIMARY OUTCOME
    const allItemsResponse = await miroApi.get(`/boards/${BOARD_ID}/items`);
    const items = allItemsResponse.data.data;
    console.log(`📈 Total board items: ${items.length}`);
    
    // Find PRIMARY OUTCOME sticky
    const primaryOutcome = items.find(item => 
      item.type === 'sticky_note' && 
      item.data?.content?.toLowerCase().includes('primary outcome')
    );
    
    if (primaryOutcome) {
      console.log('🎯 Found PRIMARY OUTCOME sticky!');
      console.log(`   ID: ${primaryOutcome.id}`);
      console.log(`   Position: (${primaryOutcome.position.x}, ${primaryOutcome.position.y})`);
      console.log(`   Content: ${primaryOutcome.data.content}`);
    } else {
      console.log('⚠️  PRIMARY OUTCOME sticky not found - searching for similar...');
      const outcomeItems = items.filter(item => 
        item.type === 'sticky_note' && 
        item.data?.content?.toLowerCase().includes('outcome')
      );
      console.log(`Found ${outcomeItems.length} items containing 'outcome':`);
      outcomeItems.slice(0, 5).forEach(item => {
        console.log(`   - "${item.data.content}" at (${item.position.x}, ${item.position.y})`);
      });
    }
    
    // Count sticky notes by color and content
    const stickyNotes = items.filter(item => item.type === 'sticky_note');
    const blankStickies = stickyNotes.filter(item => !item.data?.content || item.data.content.trim() === '');
    const populatedStickies = stickyNotes.filter(item => item.data?.content && item.data.content.trim() !== '');
    
    console.log(`\n📝 Sticky Note Analysis:`);
    console.log(`   Total stickies: ${stickyNotes.length}`);
    console.log(`   Blank stickies: ${blankStickies.length}`);
    console.log(`   Populated stickies: ${populatedStickies.length}`);
    
    // Find opportunities
    const opportunities = items.filter(item => 
      item.type === 'sticky_note' && 
      item.data?.content?.toLowerCase().includes('opp')
    );
    console.log(`\n🎯 Found ${opportunities.length} opportunity-related stickies:`);
    opportunities.forEach(opp => {
      console.log(`   - "${opp.data.content}" at (${opp.position.x}, ${opp.position.y})`);
    });
    
    return { success: true, items, primaryOutcome, blankStickies, opportunities };
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return { success: false, error };
  }
}

async function main() {
  console.log('🚀 Starting Teresa Torres Implementation Test\n');
  console.log(`Board ID: ${BOARD_ID}`);
  console.log(`Token: ${ACCESS_TOKEN ? 'Configured' : 'Missing'}\n`);
  
  const result = await testConnection();
  
  if (result.success) {
    console.log('\n✅ Ready to proceed with Teresa Torres implementation!');
    
    // Save board snapshot for reference
    require('fs').writeFileSync(
      'current-board-state.json', 
      JSON.stringify(result.items, null, 2)
    );
    console.log('📄 Board state saved to current-board-state.json');
  } else {
    console.log('\n❌ Fix connection issues before proceeding.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}