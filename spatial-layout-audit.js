#!/usr/bin/env node
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const accessToken = process.env.MIRO_ACCESS_TOKEN;
const boardId = process.env.MIRO_BOARD_ID.replace(/"/g, '');

console.log('📐 Spatial Layout & Spacing Audit');
console.log('Board ID:', boardId);
console.log('Timestamp:', new Date().toISOString());
console.log('═'.repeat(70));

const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Layout standards
const STANDARDS = {
  sectionWidth: 1400,
  sectionHeight: 1800,
  stickySize: 100,
  minSpacing: 10,      // Minimum space between items
  idealSpacing: 110,   // Ideal center-to-center distance
  maxSpacing: 200,     // Maximum before considered too sparse
  sectionPadding: 50,  // Padding from section edges
  gridTolerance: 5,    // Pixels tolerance for grid alignment
  overlapThreshold: 50 // Distance below which items are overlapping
};

// Calculate distance between two points
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Check if item is within section bounds
function isInSection(item, sectionIndex) {
  const sectionX = sectionIndex * STANDARDS.sectionWidth;
  return item.position.x >= sectionX && 
         item.position.x < sectionX + STANDARDS.sectionWidth;
}

// Analyze grid alignment
function analyzeGridAlignment(items) {
  const xPositions = items.map(i => i.position.x).sort((a, b) => a - b);
  const yPositions = items.map(i => i.position.y).sort((a, b) => a - b);
  
  // Find common grid intervals
  const xIntervals = [];
  const yIntervals = [];
  
  for (let i = 1; i < xPositions.length; i++) {
    const interval = xPositions[i] - xPositions[i-1];
    if (interval > STANDARDS.minSpacing) {
      xIntervals.push(interval);
    }
  }
  
  for (let i = 1; i < yPositions.length; i++) {
    const interval = yPositions[i] - yPositions[i-1];
    if (interval > STANDARDS.minSpacing) {
      yIntervals.push(interval);
    }
  }
  
  // Calculate consistency
  const avgXInterval = xIntervals.reduce((a, b) => a + b, 0) / xIntervals.length;
  const avgYInterval = yIntervals.reduce((a, b) => a + b, 0) / yIntervals.length;
  
  const xVariance = xIntervals.map(i => Math.abs(i - avgXInterval));
  const yVariance = yIntervals.map(i => Math.abs(i - avgYInterval));
  
  const xConsistency = xVariance.filter(v => v <= STANDARDS.gridTolerance).length / xVariance.length;
  const yConsistency = yVariance.filter(v => v <= STANDARDS.gridTolerance).length / yVariance.length;
  
  return {
    avgXSpacing: Math.round(avgXInterval),
    avgYSpacing: Math.round(avgYInterval),
    xConsistency: Math.round(xConsistency * 100),
    yConsistency: Math.round(yConsistency * 100),
    gridScore: Math.round((xConsistency + yConsistency) * 50)
  };
}

async function runSpatialAudit() {
  const report = {
    timestamp: new Date().toISOString(),
    boardId: boardId,
    sections: {},
    issues: {
      overlapping: [],
      tooClose: [],
      tooFar: [],
      misaligned: [],
      outsideBounds: []
    },
    metrics: {
      totalOverlaps: 0,
      avgSpacing: 0,
      alignmentScore: 0,
      densityScore: 0,
      layoutQuality: 0
    },
    recommendations: []
  };

  try {
    // Step 1: Collect all items
    console.log('\n📊 PHASE 1: Data Collection');
    console.log('─'.repeat(50));
    
    let allItems = [];
    let cursor = null;
    let hasMore = true;
    
    while (hasMore) {
      const params = cursor ? { cursor, limit: 50 } : { limit: 50 };
      const response = await miroApi.get(`/boards/${boardId}/items`, { params });
      
      allItems = allItems.concat(response.data.data || []);
      cursor = response.data.cursor;
      hasMore = !!cursor;
    }
    
    console.log(`   ✓ Collected ${allItems.length} items`);
    
    // Filter to positioned items
    const positionedItems = allItems.filter(item => item.position);
    const stickyNotes = positionedItems.filter(item => item.type === 'sticky_note');
    
    console.log(`   ✓ ${stickyNotes.length} sticky notes to analyze`);
    
    // Step 2: Section-by-section analysis
    console.log('\n📍 PHASE 2: Section Layout Analysis');
    console.log('─'.repeat(50));
    
    for (let sectionIndex = 0; sectionIndex <= 6; sectionIndex++) {
      const sectionItems = stickyNotes.filter(item => isInSection(item, sectionIndex));
      
      if (sectionItems.length === 0) continue;
      
      console.log(`\n   Section ${sectionIndex}: ${sectionItems.length} items`);
      
      report.sections[sectionIndex] = {
        itemCount: sectionItems.length,
        spacing: {},
        alignment: {},
        issues: []
      };
      
      // Analyze spacing
      const distances = [];
      let overlaps = 0;
      let tooClose = 0;
      let tooFar = 0;
      
      for (let i = 0; i < sectionItems.length; i++) {
        for (let j = i + 1; j < sectionItems.length; j++) {
          const dist = distance(sectionItems[i].position, sectionItems[j].position);
          distances.push(dist);
          
          if (dist < STANDARDS.overlapThreshold) {
            overlaps++;
            report.issues.overlapping.push({
              section: sectionIndex,
              items: [sectionItems[i].id, sectionItems[j].id],
              distance: Math.round(dist)
            });
          } else if (dist < STANDARDS.minSpacing + STANDARDS.stickySize) {
            tooClose++;
            report.issues.tooClose.push({
              section: sectionIndex,
              distance: Math.round(dist)
            });
          } else if (dist > STANDARDS.maxSpacing && dist < STANDARDS.sectionWidth) {
            // Check if they're meant to be neighbors
            const xDiff = Math.abs(sectionItems[i].position.x - sectionItems[j].position.x);
            const yDiff = Math.abs(sectionItems[i].position.y - sectionItems[j].position.y);
            
            if ((xDiff < 150 && yDiff > STANDARDS.maxSpacing) || 
                (yDiff < 150 && xDiff > STANDARDS.maxSpacing)) {
              tooFar++;
            }
          }
        }
      }
      
      const avgDistance = distances.length > 0 
        ? distances.reduce((a, b) => a + b, 0) / distances.length 
        : 0;
      
      report.sections[sectionIndex].spacing = {
        average: Math.round(avgDistance),
        overlaps: overlaps,
        tooClose: tooClose,
        tooFar: tooFar,
        quality: overlaps === 0 && tooClose < 5 ? 'Good' : 
                 overlaps < 3 && tooClose < 10 ? 'Fair' : 'Poor'
      };
      
      // Analyze grid alignment
      if (sectionItems.length > 5) {
        const gridAnalysis = analyzeGridAlignment(sectionItems);
        report.sections[sectionIndex].alignment = gridAnalysis;
        
        console.log(`      Spacing: Avg ${Math.round(avgDistance)}px, ${overlaps} overlaps`);
        console.log(`      Grid: X-consistency ${gridAnalysis.xConsistency}%, Y-consistency ${gridAnalysis.yConsistency}%`);
        console.log(`      Quality: ${report.sections[sectionIndex].spacing.quality}`);
      }
      
      // Check boundary padding
      const sectionX = sectionIndex * STANDARDS.sectionWidth;
      const itemsNearLeftEdge = sectionItems.filter(i => 
        i.position.x < sectionX + STANDARDS.sectionPadding
      );
      const itemsNearRightEdge = sectionItems.filter(i => 
        i.position.x > sectionX + STANDARDS.sectionWidth - STANDARDS.sectionPadding
      );
      
      if (itemsNearLeftEdge.length > 0 || itemsNearRightEdge.length > 0) {
        report.sections[sectionIndex].issues.push('Items too close to section edges');
      }
      
      report.metrics.totalOverlaps += overlaps;
    }
    
    // Step 3: Cross-section analysis
    console.log('\n🔍 PHASE 3: Cross-Section Analysis');
    console.log('─'.repeat(50));
    
    // Check for items outside section bounds
    let outsideBounds = 0;
    stickyNotes.forEach(item => {
      const sectionIndex = Math.floor(item.position.x / STANDARDS.sectionWidth);
      if (sectionIndex < 0 || sectionIndex > 6) {
        outsideBounds++;
        report.issues.outsideBounds.push({
          id: item.id,
          position: item.position
        });
      }
    });
    
    console.log(`   Items outside sections: ${outsideBounds}`);
    
    // Calculate overall spacing metrics
    const allDistances = [];
    for (let i = 0; i < stickyNotes.length; i++) {
      // Find nearest neighbor
      let minDist = Infinity;
      for (let j = 0; j < stickyNotes.length; j++) {
        if (i !== j) {
          const dist = distance(stickyNotes[i].position, stickyNotes[j].position);
          if (dist < minDist) minDist = dist;
        }
      }
      if (minDist < Infinity) {
        allDistances.push(minDist);
      }
    }
    
    report.metrics.avgSpacing = Math.round(
      allDistances.reduce((a, b) => a + b, 0) / allDistances.length
    );
    
    console.log(`   Average nearest neighbor: ${report.metrics.avgSpacing}px`);
    console.log(`   Total overlapping pairs: ${report.metrics.totalOverlaps}`);
    
    // Step 4: Visual Density Analysis
    console.log('\n📊 PHASE 4: Visual Density Analysis');
    console.log('─'.repeat(50));
    
    for (let sectionIndex = 0; sectionIndex <= 6; sectionIndex++) {
      const sectionItems = stickyNotes.filter(item => isInSection(item, sectionIndex));
      if (sectionItems.length === 0) continue;
      
      // Calculate density (items per 1000px²)
      const sectionArea = STANDARDS.sectionWidth * STANDARDS.sectionHeight;
      const itemArea = sectionItems.length * STANDARDS.stickySize * STANDARDS.stickySize;
      const density = (itemArea / sectionArea) * 100;
      
      report.sections[sectionIndex].density = {
        percentage: Math.round(density * 10) / 10,
        rating: density < 5 ? 'Sparse' : 
                density < 15 ? 'Balanced' : 
                density < 25 ? 'Dense' : 'Overcrowded'
      };
      
      console.log(`   Section ${sectionIndex}: ${report.sections[sectionIndex].density.percentage}% coverage (${report.sections[sectionIndex].density.rating})`);
    }
    
    // Step 5: Layout Quality Score
    console.log('\n✨ PHASE 5: Layout Quality Assessment');
    console.log('─'.repeat(50));
    
    // Calculate alignment score
    let totalAlignment = 0;
    let alignmentCount = 0;
    Object.values(report.sections).forEach(section => {
      if (section.alignment && section.alignment.gridScore) {
        totalAlignment += section.alignment.gridScore;
        alignmentCount++;
      }
    });
    report.metrics.alignmentScore = alignmentCount > 0 
      ? Math.round(totalAlignment / alignmentCount)
      : 0;
    
    // Calculate density score
    let goodDensity = 0;
    Object.values(report.sections).forEach(section => {
      if (section.density && section.density.rating === 'Balanced') {
        goodDensity++;
      }
    });
    report.metrics.densityScore = Math.round((goodDensity / 7) * 100);
    
    // Calculate overall layout quality
    const spacingScore = Math.max(0, 100 - (report.metrics.totalOverlaps * 5));
    const avgSpacingScore = report.metrics.avgSpacing > 80 && report.metrics.avgSpacing < 130 ? 100 :
                           report.metrics.avgSpacing > 60 && report.metrics.avgSpacing < 150 ? 75 : 50;
    
    report.metrics.layoutQuality = Math.round(
      (spacingScore * 0.4) + 
      (report.metrics.alignmentScore * 0.3) + 
      (report.metrics.densityScore * 0.2) +
      (avgSpacingScore * 0.1)
    );
    
    const grade = report.metrics.layoutQuality >= 90 ? 'A' :
                  report.metrics.layoutQuality >= 80 ? 'B' :
                  report.metrics.layoutQuality >= 70 ? 'C' :
                  report.metrics.layoutQuality >= 60 ? 'D' : 'F';
    
    console.log(`\n   Spacing Score: ${spacingScore}/100`);
    console.log(`   Alignment Score: ${report.metrics.alignmentScore}/100`);
    console.log(`   Density Score: ${report.metrics.densityScore}/100`);
    console.log(`   Average Spacing Score: ${avgSpacingScore}/100`);
    console.log(`\n   📊 Overall Layout Quality: ${report.metrics.layoutQuality}/100 (Grade: ${grade})`);
    
    // Step 6: Generate Recommendations
    console.log('\n💡 PHASE 6: Recommendations');
    console.log('─'.repeat(50));
    
    if (report.metrics.totalOverlaps > 10) {
      report.recommendations.push(`Fix ${report.metrics.totalOverlaps} overlapping item pairs`);
    }
    
    if (report.metrics.avgSpacing < 80) {
      report.recommendations.push('Increase spacing between items (current avg: ' + report.metrics.avgSpacing + 'px, ideal: 110px)');
    } else if (report.metrics.avgSpacing > 150) {
      report.recommendations.push('Reduce spacing between items for better grouping');
    }
    
    if (report.metrics.alignmentScore < 70) {
      report.recommendations.push('Improve grid alignment for better visual consistency');
    }
    
    Object.entries(report.sections).forEach(([section, data]) => {
      if (data.density && data.density.rating === 'Overcrowded') {
        report.recommendations.push(`Section ${section}: Reduce density or spread items`);
      } else if (data.density && data.density.rating === 'Sparse') {
        report.recommendations.push(`Section ${section}: Group items closer together`);
      }
    });
    
    if (report.issues.outsideBounds.length > 0) {
      report.recommendations.push(`Move ${report.issues.outsideBounds.length} items back into section boundaries`);
    }
    
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    
    // Step 7: Problem Areas
    console.log('\n⚠️  PHASE 7: Problem Areas');
    console.log('─'.repeat(50));
    
    if (report.issues.overlapping.length > 0) {
      console.log(`\n   Overlapping Items (${report.issues.overlapping.length} pairs):`);
      report.issues.overlapping.slice(0, 5).forEach(overlap => {
        console.log(`      Section ${overlap.section}: ${overlap.distance}px apart`);
      });
      if (report.issues.overlapping.length > 5) {
        console.log(`      ... and ${report.issues.overlapping.length - 5} more`);
      }
    }
    
    // Find sections with worst spacing
    const worstSections = Object.entries(report.sections)
      .filter(([_, data]) => data.spacing && data.spacing.quality === 'Poor')
      .map(([section, _]) => section);
    
    if (worstSections.length > 0) {
      console.log(`\n   Sections with poor spacing: ${worstSections.join(', ')}`);
    }
    
    // Step 8: Save detailed report
    const reportFilename = `spatial-audit-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFilename}`);
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📐 SPATIAL LAYOUT SUMMARY');
    console.log('═'.repeat(70));
    
    console.log(`\n   Layout Quality Grade: ${grade}`);
    console.log(`   Overall Score: ${report.metrics.layoutQuality}/100`);
    console.log(`   Overlapping Items: ${report.metrics.totalOverlaps} pairs`);
    console.log(`   Average Spacing: ${report.metrics.avgSpacing}px (ideal: 110px)`);
    console.log(`   Alignment Consistency: ${report.metrics.alignmentScore}%`);
    console.log(`   Density Balance: ${report.metrics.densityScore}%`);
    
    if (report.metrics.layoutQuality >= 80) {
      console.log('\n   ✅ Layout quality is GOOD - minor adjustments recommended');
    } else if (report.metrics.layoutQuality >= 60) {
      console.log('\n   ⚠️  Layout quality is FAIR - several improvements needed');
    } else {
      console.log('\n   ❌ Layout quality is POOR - significant reorganization required');
    }
    
    console.log('\n' + '═'.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Audit Error:', error.response ? error.response.data : error.message);
  }
}

// Run the spatial audit
runSpatialAudit();