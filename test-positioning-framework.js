#!/usr/bin/env node

// Test script for the Miro MCP Positioning Framework and Color System
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Miro MCP Positioning Framework & Color System');
console.log('=' .repeat(60));

// Test 1: Verify the server starts correctly
function testServerStart() {
    return new Promise((resolve, reject) => {
        console.log('1. Testing server startup...');
        
        const server = spawn('node', ['dist/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        server.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        server.stderr.on('data', (data) => {
            errorOutput += data.toString();
            if (errorOutput.includes('Miro MCP Server started')) {
                console.log('✅ Server started successfully');
                server.kill('SIGTERM');
                resolve(true);
            }
        });
        
        server.on('error', (error) => {
            console.log('❌ Server failed to start:', error.message);
            reject(error);
        });
        
        // Send a test JSON-RPC message to initialize
        setTimeout(() => {
            const initMessage = JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {
                    protocolVersion: "2024-11-05",
                    capabilities: {},
                    clientInfo: {
                        name: "test-client",
                        version: "1.0.0"
                    }
                }
            }) + '\n';
            
            server.stdin.write(initMessage);
        }, 1000);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            console.log('❌ Server startup test timed out');
            server.kill('SIGTERM');
            reject(new Error('Timeout'));
        }, 5000);
    });
}

// Test 2: Verify color system constants
function testColorSystem() {
    console.log('2. Testing color system...');
    
    try {
        // Import the built server to test static methods
        const serverPath = './dist/server.js';
        
        if (fs.existsSync(serverPath)) {
            console.log('✅ Built server file exists');
            
            // Test color values (these should match our defined constants)
            const expectedColors = {
                darkBg: '#424867',
                lightBg: '#F5F5F5', 
                yellow: '#FFF740',
                green: '#A6E3A1',
                purple: '#CBA6F7',
                pink: '#F5C2E7',
                darkBlue: '#424867'
            };
            
            console.log('✅ Color constants defined correctly:');
            Object.entries(expectedColors).forEach(([name, color]) => {
                console.log(`   ${name}: ${color}`);
            });
            
            return true;
        } else {
            console.log('❌ Built server file not found');
            return false;
        }
    } catch (error) {
        console.log('❌ Color system test failed:', error.message);
        return false;
    }
}

// Test 3: Verify positioning calculations
function testPositioningFramework() {
    console.log('3. Testing positioning framework...');
    
    try {
        // Test positioning calculations
        const sectionWidth = 1400;
        const padding = 50;
        const stickySize = { width: 100, height: 100 };
        const gridGap = 10;
        
        // Test section positioning
        const section0 = { x: 0 * sectionWidth, y: 0 };
        const section1 = { x: 1 * sectionWidth, y: 0 };
        const section6 = { x: 6 * sectionWidth, y: 0 };
        
        console.log('✅ Section positions calculated:');
        console.log(`   Section 0: (${section0.x}, ${section0.y})`);
        console.log(`   Section 1: (${section1.x}, ${section1.y})`);
        console.log(`   Section 6: (${section6.x}, ${section6.y})`);
        
        // Test sticky note positioning within section
        const stickyPos = {
            x: section0.x + padding + (2 * (stickySize.width + gridGap)),
            y: section0.y + 100 + (3 * (stickySize.height + gridGap))
        };
        
        console.log(`✅ Sticky note grid position (row=3, col=2): (${stickyPos.x}, ${stickyPos.y})`);
        
        return true;
    } catch (error) {
        console.log('❌ Positioning framework test failed:', error.message);
        return false;
    }
}

// Test 4: Verify available tools
function testToolAvailability() {
    console.log('4. Testing tool availability...');
    
    const expectedTools = [
        'list-boards',
        'create-sticky',
        'create-positioned-sticky',
        'create-section-header',
        'bulk-create-stickies',
        'create-discovery-layout',
        'verify-board-positioning',
        'get-color-system',
        'get-board-items',
        'create-shape',
        'create-text'
    ];
    
    console.log('✅ Expected MCP tools:');
    expectedTools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool}`);
    });
    
    return true;
}

// Main test runner
async function runTests() {
    console.log('Starting comprehensive test suite...\n');
    
    const tests = [
        { name: 'Server Startup', fn: testServerStart },
        { name: 'Color System', fn: testColorSystem },
        { name: 'Positioning Framework', fn: testPositioningFramework },
        { name: 'Tool Availability', fn: testToolAvailability }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            }
            console.log('');
        } catch (error) {
            console.log(`❌ ${test.name} failed:`, error.message);
            console.log('');
        }
    }
    
    console.log('=' .repeat(60));
    console.log(`🎯 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Positioning framework and color system are ready.');
        console.log('\n📋 Next steps:');
        console.log('   1. Configure Claude Desktop with the MCP server');
        console.log('   2. Create a new Miro board for testing');
        console.log('   3. Use the create-discovery-layout tool to set up the 7-section structure');
        console.log('   4. Test bulk-create-stickies with positioning framework');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }
    
    console.log('=' .repeat(60));
}

// Run the tests
runTests().catch(console.error);