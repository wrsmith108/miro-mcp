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

// UX/UI Requirements frame details
const frameX = 3661.490243569511;
const frameY = 18267.379098828635;
const frameWidth = 7988.8433392170255;
const frameHeight = 4493.724378309576;

// Positioning configuration
const startX = frameX + 400;  // Start 400px from left edge
const startY = frameY + 300;  // Start 300px from top edge
const nodeWidth = 200;
const nodeHeight = 60;
const horizontalGap = 250;
const verticalGap = 120;

// Define the architecture structure with positions
const nodes = {
  // Level 0 - Entry Points
  'Launch': { level: 0, x: 0, y: 0, label: 'Launch Screen' },
  'Onboarding': { level: 1, x: -1, y: 0, label: 'Onboarding Flow' },
  'Login': { level: 1, x: 1, y: 0, label: 'Login System' },
  
  // Level 2 - Post Login
  'Profile': { level: 2, x: 0, y: 0, label: 'User Profile' },
  'MainApp': { level: 2, x: 2, y: 0, label: 'Main Application' },
  
  // Level 3 - Main App Branches
  'Navigation': { level: 3, x: -2, y: 0, label: 'Navigation System' },
  'DataMgmt': { level: 3, x: 0, y: 0, label: 'Data Management' },
  'Visualization': { level: 3, x: 2, y: 0, label: '3D Visualization' },
  'Tools': { level: 3, x: 4, y: 0, label: 'Tools & Controls' },
  
  // Level 4 - Data Management Branch
  'DataSource': { level: 4, x: -1, y: 0, label: 'Data Sources' },
  'Import': { level: 4, x: 1, y: 0, label: 'Import Flow' },
  'Dataset': { level: 5, x: -1, y: 0, label: 'Datasets' },
  'DataPoints': { level: 6, x: -1, y: 0, label: 'Data Points' },
  
  // Level 4 - Visualization Branch
  'Galaxy': { level: 4, x: 2, y: 0, label: 'Galaxy View' },
  'Objects': { level: 5, x: 2, y: 0, label: '3D Objects' },
  'Attributes': { level: 6, x: 1.5, y: 0, label: 'Visual Attributes' },
  'SpatialAttr': { level: 6, x: 2.5, y: 0, label: 'Spatial Attributes' },
  'Labels': { level: 5, x: 3, y: 0, label: 'Object Labels' },
  
  // Level 4 - Tools Branch
  'Filters': { level: 4, x: 3.5, y: 0, label: 'Filter System' },
  'Search': { level: 4, x: 4.5, y: 0, label: 'Search Function' },
  'Scenarios': { level: 4, x: 5.5, y: 0, label: 'AI/ML Scenarios' },
  'Selection': { level: 4, x: 6.5, y: 0, label: 'Selection Tools' },
  
  // Level 5 - Selection Branch
  'SingleSelect': { level: 5, x: 6, y: 0, label: 'Single Object Selection' },
  'MultiSelect': { level: 5, x: 7, y: 0, label: 'Multiple Object Selection' },
  'ObjectModal': { level: 6, x: 6, y: 0, label: 'Object Modal' },
  'MultiModal': { level: 6, x: 7, y: 0, label: 'Multiple Object Modals' },
  
  // Level 4 - Saved Configurations
  'SavedViews': { level: 4, x: 8, y: 0, label: 'Saved Views/Settings' },
  'Lists': { level: 4, x: 9, y: 0, label: 'Object Lists' },
  'Favourites': { level: 5, x: 8, y: 0, label: 'Favourites System' },
  
  // Level 4 - Advanced Features
  'Compare': { level: 4, x: 10, y: 0, label: 'Compare Galaxies' },
  'SpinOff': { level: 5, x: 10, y: 0, label: 'Spin-off Galaxy' },
  'Timeline': { level: 4, x: 11, y: 0, label: 'Timeline Navigation' },
  
  // Level 3 - Output Systems (from MainApp)
  'Export': { level: 3, x: 6, y: 0, label: 'Export System' },
  'Share': { level: 3, x: 8, y: 0, label: 'Sharing System' },
  'Formats': { level: 4, x: 12, y: 0, label: 'Export Formats' },
  'DynamicSnippet': { level: 4, x: 13, y: 0, label: 'Dynamic Galaxy Snippet' },
  
  // Level 3 - Settings and Help (from MainApp)
  'Settings': { level: 3, x: 10, y: 0, label: 'User Settings' },
  'Defaults': { level: 4, x: 14, y: 0, label: 'Smart Defaults' },
  'Accessibility': { level: 4, x: 15, y: 0, label: 'Accessibility Options' },
  'Customization': { level: 4, x: 16, y: 0, label: 'UI Customization' },
  'Help': { level: 3, x: 12, y: 0, label: 'Help System' },
  'FAQ': { level: 4, x: 17, y: 0, label: 'FAQs' },
  'Documentation': { level: 4, x: 18, y: 0, label: 'Documentation' },
  
  // Level 4 - UI Theme
  'UITheme': { level: 4, x: 19, y: 0, label: 'UI Theme System' },
  'LightMode': { level: 5, x: 18.5, y: 0, label: 'Light Mode' },
  'DarkMode': { level: 5, x: 19.5, y: 0, label: 'Dark Mode' }
};

// Define connections based on the Mermaid diagram
const connections = [
  ['Launch', 'Onboarding'],
  ['Launch', 'Login'],
  ['Login', 'Profile'],
  ['Login', 'MainApp'],
  ['MainApp', 'Navigation'],
  ['MainApp', 'DataMgmt'],
  ['MainApp', 'Visualization'],
  ['MainApp', 'Tools'],
  ['DataMgmt', 'DataSource'],
  ['DataMgmt', 'Import'],
  ['DataSource', 'Dataset'],
  ['Dataset', 'DataPoints'],
  ['Visualization', 'Galaxy'],
  ['Galaxy', 'Objects'],
  ['Objects', 'Attributes'],
  ['Objects', 'SpatialAttr'],
  ['Galaxy', 'Labels'],
  ['Tools', 'Filters'],
  ['Tools', 'Search'],
  ['Tools', 'Scenarios'],
  ['Tools', 'Selection'],
  ['Selection', 'SingleSelect'],
  ['Selection', 'MultiSelect'],
  ['SingleSelect', 'ObjectModal'],
  ['MultiSelect', 'MultiModal'],
  ['Tools', 'SavedViews'],
  ['Tools', 'Lists'],
  ['SavedViews', 'Favourites'],
  ['Tools', 'Compare'],
  ['Compare', 'SpinOff'],
  ['Tools', 'Timeline'],
  ['MainApp', 'Export'],
  ['MainApp', 'Share'],
  ['Export', 'Formats'],
  ['Share', 'DynamicSnippet'],
  ['MainApp', 'Settings'],
  ['Settings', 'Defaults'],
  ['Settings', 'Accessibility'],
  ['Settings', 'Customization'],
  ['MainApp', 'Help'],
  ['Help', 'FAQ'],
  ['Help', 'Documentation'],
  ['Settings', 'UITheme'],
  ['UITheme', 'LightMode'],
  ['UITheme', 'DarkMode']
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createUXArchitectureDiagram() {
  try {
    const boardId = process.env.MIRO_BOARD_ID || 'uXjVJS1vI0k=';
    console.log('Creating UX Architecture Diagram in Miro...\n');
    
    const createdNodes = {};
    const nodeIds = {};
    
    // Step 1: Create all nodes as shapes with text
    console.log('Step 1: Creating diagram nodes...');
    
    for (const [key, node] of Object.entries(nodes)) {
      const x = startX + (node.x * horizontalGap);
      const y = startY + (node.level * verticalGap);
      
      try {
        // Create a shape (rectangle) for each node
        const shapeResponse = await miroApi.post(`/boards/${boardId}/shapes`, {
          data: {
            shape: 'round_rectangle'
          },
          position: { x, y },
          geometry: {
            width: nodeWidth,
            height: nodeHeight
          },
          style: {
            fillColor: node.level === 0 ? '#2D9BF0' : // Blue for entry
                      node.level === 2 ? '#8FD14F' : // Green for main app
                      node.level === 3 ? '#FAC710' : // Yellow for main branches
                      '#F5C2E7', // Pink for sub-components
            borderColor: '#424867',
            borderWidth: 2
          }
        });
        
        // Add text on top of the shape
        const textResponse = await miroApi.post(`/boards/${boardId}/texts`, {
          data: {
            content: `<p><strong>${node.label}</strong></p>`
          },
          position: { x, y },
          style: {
            fontSize: 12,
            textAlign: 'center',
            color: '#000000'
          }
        });
        
        nodeIds[key] = shapeResponse.data.id;
        createdNodes[key] = {
          shapeId: shapeResponse.data.id,
          textId: textResponse.data.id,
          x, y
        };
        
        console.log(`Created: ${node.label} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        
        // Small delay to avoid rate limiting
        await sleep(50);
        
      } catch (nodeError) {
        console.error(`Failed to create node ${node.label}:`, nodeError.response?.data?.message || nodeError.message);
      }
    }
    
    console.log(`\nCreated ${Object.keys(createdNodes).length} nodes\n`);
    
    // Step 2: Create connectors between nodes
    console.log('Step 2: Creating connectors...');
    
    let connectorCount = 0;
    for (const [from, to] of connections) {
      if (nodeIds[from] && nodeIds[to]) {
        try {
          await miroApi.post(`/boards/${boardId}/connectors`, {
            startItem: { id: nodeIds[from] },
            endItem: { id: nodeIds[to] },
            style: {
              startStrokeCap: 'none',
              endStrokeCap: 'arrow',
              strokeColor: '#424867',
              strokeWidth: 2
            }
          });
          
          connectorCount++;
          console.log(`Connected: ${nodes[from].label} → ${nodes[to].label}`);
          
          // Small delay to avoid rate limiting
          await sleep(50);
          
        } catch (connError) {
          console.error(`Failed to connect ${from} to ${to}:`, connError.response?.data?.message || connError.message);
        }
      }
    }
    
    console.log(`\n✅ Successfully created UX Architecture diagram!`);
    console.log(`   - ${Object.keys(createdNodes).length} nodes`);
    console.log(`   - ${connectorCount} connectors`);
    console.log(`   - Located in UX/UI Requirements frame`);
    
  } catch (error) {
    console.error('Error creating diagram:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

createUXArchitectureDiagram();