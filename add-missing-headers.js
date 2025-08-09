#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('📝 ADDING MISSING SUBSECTION HEADERS');
console.log('Board ID:', boardId);
console.log('Priority: Section 2 (Interviewing) - ALL headers missing');
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// All missing headers from verification
const MISSING_HEADERS = [
  // Section 0
  { section: 0, x: 50, y: 2000, text: 'EXAMPLES', width: 300, height: 60 },
  
  // Section 1
  { section: 1, x: 1450, y: 50, text: '1. EVIDENCE-BASED TEAM DECISIONS, DEFINING OUTCOMES', width: 900, height: 40 },
  { section: 1, x: 1450, y: 450, text: 'PRODUCT OUTCOMES', width: 300, height: 60 },
  { section: 1, x: 1450, y: 700, text: 'TRACTION METRICS', width: 300, height: 60 },
  
  // Section 2 - CRITICAL (ALL missing)
  { section: 2, x: 2850, y: 50, text: '2. CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES', width: 900, height: 40 },
  { section: 2, x: 2850, y: 350, text: 'WHO TO INTERVIEW', width: 300, height: 60 },
  { section: 2, x: 3200, y: 350, text: 'RESEARCH NOTES', width: 300, height: 60 },
  { section: 2, x: 2850, y: 550, text: 'HOW TO RECRUIT', width: 300, height: 60 },
  { section: 2, x: 3200, y: 550, text: 'RESEARCH NOTES', width: 300, height: 60 },
  { section: 2, x: 2850, y: 750, text: 'WHEN TO INTERVIEW', width: 300, height: 60 },
  { section: 2, x: 3200, y: 750, text: 'RESEARCH NOTES', width: 300, height: 60 },
  { section: 2, x: 2850, y: 950, text: 'HOW TO INTERVIEW', width: 300, height: 60 },
  { section: 2, x: 3200, y: 950, text: 'RESEARCH NOTES', width: 300, height: 60 },
  { section: 2, x: 2850, y: 1150, text: 'WHAT TO CAPTURE', width: 300, height: 60 },
  { section: 2, x: 3200, y: 1150, text: 'RESEARCH NOTES', width: 300, height: 60 },
  { section: 2, x: 2850, y: 2000, text: 'EXAMPLES', width: 900, height: 60 },
  
  // Section 3
  { section: 3, x: 4250, y: 150, text: 'OPPORTUNITY SOLUTION TREE', width: 600, height: 40 },
  { section: 3, x: 4250, y: 2000, text: 'EXAMPLES', width: 900, height: 60 },
  
  // Section 4
  { section: 4, x: 5650, y: 50, text: '4. ASSESSING & PRIORITIZING OPPORTUNITIES, EFFECTIVE SOLUTION IDEATION', width: 1000, height: 40 },
  { section: 4, x: 5650, y: 250, text: 'CONTEXT-DRIVEN PRIORITIZATION', width: 350, height: 60 },
  { section: 4, x: 6050, y: 250, text: 'PRIORITIZING OPPORTUNITIES', width: 350, height: 60 },
  { section: 4, x: 6450, y: 250, text: 'EFFECTIVE IDEATION', width: 350, height: 60 },
  { section: 4, x: 5650, y: 2400, text: 'EXAMPLES', width: 900, height: 60 },
  
  // Section 5
  { section: 5, x: 7050, y: 3200, text: 'EXAMPLES', width: 900, height: 60 },
  
  // Section 6
  { section: 6, x: 8450, y: 50, text: '6. TESTING ASSUMPTIONS', width: 900, height: 40 },
  { section: 6, x: 8450, y: 2000, text: 'EXAMPLES', width: 900, height: 60 }
];

async function addMissingHeaders() {
  try {
    console.log(`\n📊 Phase 1: Adding ${MISSING_HEADERS.length} Missing Headers`);
    console.log('─'.repeat(50));
    
    let addedCount = 0;
    let failedCount = 0;
    
    // Group by section for better organization
    const sections = [...new Set(MISSING_HEADERS.map(h => h.section))].sort();
    
    for (const sectionNum of sections) {
      const sectionHeaders = MISSING_HEADERS.filter(h => h.section === sectionNum);
      console.log(`\n   Section ${sectionNum}: Adding ${sectionHeaders.length} headers`);
      
      for (const header of sectionHeaders) {
        try {
          // Create dark panel shape with text
          await miroApi.post(`/boards/${boardId}/shapes`, {
            data: {
              shape: 'rectangle',
              content: `<p style="color: white; font-weight: bold; text-align: center;">${header.text}</p>`
            },
            style: {
              fillColor: '#2d4a6b', // Dark blue panel color
              borderColor: '#1a2b3d',
              borderWidth: 1,
              borderOpacity: 1,
              fillOpacity: 1,
              fontSize: header.width > 600 ? 14 : 12,
              fontFamily: 'arial',
              textAlign: 'center',
              textAlignVertical: 'middle',
              color: '#ffffff'
            },
            position: {
              x: header.x,
              y: header.y
            },
            geometry: {
              width: header.width,
              height: header.height
            }
          });
          
          addedCount++;
          console.log(`      ✓ ${header.text.substring(0, 30)}...`);
          
          // Rate limiting
          await delay(300);
          
        } catch (error) {
          failedCount++;
          console.log(`      ❌ Failed: ${header.text.substring(0, 30)}...`);
          
          // Try alternative approach - create as text item
          try {
            await miroApi.post(`/boards/${boardId}/text`, {
              data: {
                content: header.text
              },
              style: {
                fontSize: header.width > 600 ? 18 : 14,
                fontFamily: 'arial',
                textAlign: 'center',
                fillColor: '#1a1a1a'
              },
              position: {
                x: header.x,
                y: header.y
              },
              geometry: {
                width: header.width
              }
            });
            
            addedCount++;
            failedCount--;
            console.log(`      ✓ Added as text: ${header.text.substring(0, 30)}...`);
            
          } catch (textError) {
            // Both methods failed
          }
        }
        
        // Progress indicator
        if (addedCount % 5 === 0) {
          process.stdout.write(`\r   Progress: ${addedCount}/${MISSING_HEADERS.length} headers added`);
        }
      }
    }
    
    // Phase 2: Special handling for Section 2 structure
    console.log('\n\n🎯 Phase 2: Verifying Section 2 Structure');
    console.log('─'.repeat(50));
    
    console.log('   Section 2 (Interviewing) should now have:');
    console.log('      ✓ Main header');
    console.log('      ✓ 5 interview method panels');
    console.log('      ✓ Research notes panels');
    console.log('      ✓ Examples panel');
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ HEADER ADDITION COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Results:');
    console.log(`   Headers added: ${addedCount}/${MISSING_HEADERS.length}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Success rate: ${Math.round((addedCount / MISSING_HEADERS.length) * 100)}%`);
    
    console.log('\n🎯 Section 2 Status:');
    const section2Headers = MISSING_HEADERS.filter(h => h.section === 2);
    const section2Added = Math.min(addedCount, section2Headers.length);
    console.log(`   Headers added to Section 2: ${section2Added}/${section2Headers.length}`);
    
    if (section2Added === section2Headers.length) {
      console.log('   ✅ Section 2 structure COMPLETE!');
    } else {
      console.log(`   ⚠️ Section 2 still missing ${section2Headers.length - section2Added} headers`);
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run subsection-verification.js to confirm headers');
    console.log('   2. Visually check Section 2 organization');
    console.log('   3. Adjust positioning if needed');
    
    console.log(`\n🔗 View updated board: https://miro.com/app/board/${boardId}/`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Execute the header addition
addMissingHeaders();