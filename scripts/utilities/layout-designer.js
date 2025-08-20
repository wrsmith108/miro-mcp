#!/usr/bin/env node

// Layout Designer Module for Miro Board
// Ensures proper spacing and prevents sticky overlaps
// Can be integrated into swarm agents and standalone scripts

class LayoutDesigner {
  constructor(config = {}) {
    // Default sticky dimensions and padding
    this.STICKY_DIMENSIONS = {
      square: { width: 200, height: 200 },
      rectangle: { width: 250, height: 150 },
      default: { width: 200, height: 200 }
    };
    
    // Spacing configuration
    this.SPACING = {
      MINIMUM_PADDING: config.minPadding || 50,        // Minimum space between stickies
      HORIZONTAL_GAP: config.horizontalGap || 250,      // Horizontal spacing
      VERTICAL_GAP: config.verticalGap || 250,          // Vertical spacing
      CONNECTOR_CLEARANCE: config.connectorClearance || 30,  // Extra space for connectors
      SECTION_MARGIN: config.sectionMargin || 100       // Margin between sections
    };
    
    // Grid configuration for structured layouts
    this.GRID = {
      ENABLED: config.useGrid !== false,
      CELL_WIDTH: config.gridCellWidth || 300,
      CELL_HEIGHT: config.gridCellHeight || 300,
      SNAP_TO_GRID: config.snapToGrid !== false
    };
    
    // Track occupied spaces to prevent collisions
    this.occupiedSpaces = [];
    this.placedItems = new Map();
  }
  
  // Reset tracking for new layout
  reset() {
    this.occupiedSpaces = [];
    this.placedItems.clear();
  }
  
  // Check if two rectangles overlap
  detectCollision(rect1, rect2, padding = 0) {
    return !(
      rect1.x + rect1.width + padding < rect2.x ||
      rect2.x + rect2.width + padding < rect1.x ||
      rect1.y + rect1.height + padding < rect2.y ||
      rect2.y + rect2.height + padding < rect1.y
    );
  }
  
  // Find a safe position that doesn't overlap with existing items
  findSafePosition(desiredPos, dimensions, shape = 'square') {
    const dims = this.STICKY_DIMENSIONS[shape] || this.STICKY_DIMENSIONS.default;
    const rect = {
      x: desiredPos.x,
      y: desiredPos.y,
      width: dimensions?.width || dims.width,
      height: dimensions?.height || dims.height
    };
    
    // Check for collisions with existing items
    let hasCollision = false;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      hasCollision = false;
      
      for (const occupied of this.occupiedSpaces) {
        if (this.detectCollision(rect, occupied, this.SPACING.MINIMUM_PADDING)) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) {
        // Found safe position
        this.occupiedSpaces.push({ ...rect });
        return { x: rect.x, y: rect.y };
      }
      
      // Adjust position to avoid collision
      if (attempts % 2 === 0) {
        // Try moving right
        rect.x += this.SPACING.HORIZONTAL_GAP;
      } else {
        // Try moving down and reset x
        rect.x = desiredPos.x;
        rect.y += this.SPACING.VERTICAL_GAP;
      }
      
      attempts++;
    }
    
    // Fallback: place with offset based on number of items
    const offset = this.occupiedSpaces.length * 30;
    return {
      x: desiredPos.x + offset,
      y: desiredPos.y + offset
    };
  }
  
  // Calculate positions for a hierarchical tree structure
  calculateTreeLayout(rootPos, levels) {
    const positions = [];
    const levelWidth = this.SPACING.HORIZONTAL_GAP * 3;
    const levelHeight = this.SPACING.VERTICAL_GAP * 1.5;
    
    // Place root
    positions.push({
      level: 0,
      index: 0,
      position: this.findSafePosition(rootPos, null, 'square')
    });
    
    // Calculate positions for each level
    levels.forEach((level, levelIndex) => {
      const itemCount = level.length;
      const totalWidth = itemCount * this.SPACING.HORIZONTAL_GAP;
      const startX = rootPos.x - (totalWidth / 2);
      const y = rootPos.y + ((levelIndex + 1) * levelHeight);
      
      level.forEach((item, itemIndex) => {
        const x = startX + (itemIndex * this.SPACING.HORIZONTAL_GAP);
        positions.push({
          level: levelIndex + 1,
          index: itemIndex,
          position: this.findSafePosition({ x, y }, null, item.shape || 'square'),
          item: item
        });
      });
    });
    
    return positions;
  }
  
  // Calculate positions for a grid layout
  calculateGridLayout(startPos, items, columns = 3) {
    const positions = [];
    
    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      const x = startPos.x + (col * this.GRID.CELL_WIDTH);
      const y = startPos.y + (row * this.GRID.CELL_HEIGHT);
      
      positions.push({
        index: index,
        position: this.findSafePosition({ x, y }, null, item.shape || 'square'),
        item: item
      });
    });
    
    return positions;
  }
  
  // Calculate positions for a horizontal flow layout
  calculateFlowLayout(startPos, items, maxWidth = 1200) {
    const positions = [];
    let currentX = startPos.x;
    let currentY = startPos.y;
    let rowHeight = 0;
    
    items.forEach((item, index) => {
      const dims = this.STICKY_DIMENSIONS[item.shape || 'square'];
      
      // Check if item fits in current row
      if (currentX + dims.width > startPos.x + maxWidth && index > 0) {
        // Move to next row
        currentX = startPos.x;
        currentY += rowHeight + this.SPACING.VERTICAL_GAP;
        rowHeight = 0;
      }
      
      const position = this.findSafePosition({ x: currentX, y: currentY }, dims, item.shape);
      positions.push({
        index: index,
        position: position,
        item: item
      });
      
      // Update current position
      currentX += dims.width + this.SPACING.HORIZONTAL_GAP;
      rowHeight = Math.max(rowHeight, dims.height);
    });
    
    return positions;
  }
  
  // Calculate positions for user journey mapping
  calculateJourneyLayout(framePos, phases) {
    const layout = {
      phases: [],
      moments: [],
      stories: [],
      painPoints: []
    };
    
    const phaseWidth = 500;
    const momentHeight = 400;
    
    phases.forEach((phase, phaseIndex) => {
      const phaseX = framePos.x - 600 + (phaseIndex * phaseWidth);
      const phaseY = framePos.y;
      
      // Phase header position
      layout.phases.push({
        phase: phase.title,
        position: this.findSafePosition({ x: phaseX, y: phaseY }, null, 'rectangle')
      });
      
      // Key moments for this phase
      phase.keyMoments.forEach((moment, momentIndex) => {
        const momentX = phaseX;
        const momentY = phaseY + 200 + (momentIndex * momentHeight);
        
        // Moment position
        const momentPos = this.findSafePosition({ x: momentX, y: momentY }, null, 'square');
        layout.moments.push({
          moment: moment.moment,
          position: momentPos
        });
        
        // User stories (right side)
        moment.stories.forEach((story, storyIndex) => {
          const storyX = momentX + 250;
          const storyY = momentY + (storyIndex * 80);
          
          layout.stories.push({
            story: story,
            position: this.findSafePosition({ x: storyX, y: storyY }, null, 'square')
          });
        });
        
        // Pain points (left side)
        moment.painPoints.forEach((pain, painIndex) => {
          const painX = momentX - 250;
          const painY = momentY + (painIndex * 80);
          
          layout.painPoints.push({
            pain: pain,
            position: this.findSafePosition({ x: painX, y: painY }, null, 'square')
          });
        });
      });
    });
    
    return layout;
  }
  
  // Calculate positions for Teresa Torres Opportunity Solution Tree
  calculateOpportunitySolutionTree(outcomePos, opportunities) {
    const layout = {
      outcome: null,
      opportunities: [],
      solutions: [],
      experiments: []
    };
    
    // Place outcome at top
    layout.outcome = this.findSafePosition(outcomePos, null, 'square');
    
    // Calculate opportunity positions
    const oppCount = opportunities.length;
    const totalWidth = oppCount * 400;
    const startX = outcomePos.x - (totalWidth / 2);
    
    opportunities.forEach((opp, oppIndex) => {
      const oppX = startX + (oppIndex * 400);
      const oppY = outcomePos.y + 300;
      
      const oppPos = this.findSafePosition({ x: oppX, y: oppY }, null, 'square');
      layout.opportunities.push({
        opportunity: opp,
        position: oppPos
      });
      
      // Solutions under each opportunity
      if (opp.solutions) {
        opp.solutions.forEach((solution, solIndex) => {
          const solX = oppX - 100 + (solIndex * 120);
          const solY = oppY + 250;
          
          layout.solutions.push({
            solution: solution,
            position: this.findSafePosition({ x: solX, y: solY }, null, 'square')
          });
        });
      }
      
      // Experiments under solutions
      if (opp.experiments) {
        opp.experiments.forEach((experiment, expIndex) => {
          const expX = oppX;
          const expY = oppY + 450 + (expIndex * 100);
          
          layout.experiments.push({
            experiment: experiment,
            position: this.findSafePosition({ x: expX, y: expY }, null, 'square')
          });
        });
      }
    });
    
    return layout;
  }
  
  // Validate and adjust a layout to ensure no overlaps
  validateLayout(items) {
    const adjusted = [];
    this.reset();
    
    items.forEach(item => {
      const safePos = this.findSafePosition(
        item.position,
        item.dimensions,
        item.shape
      );
      
      adjusted.push({
        ...item,
        position: safePos,
        wasAdjusted: safePos.x !== item.position.x || safePos.y !== item.position.y
      });
    });
    
    return adjusted;
  }
  
  // Generate a report of the layout
  generateLayoutReport() {
    return {
      totalItems: this.occupiedSpaces.length,
      boundingBox: this.calculateBoundingBox(),
      density: this.calculateDensity(),
      collisions: this.detectAllCollisions()
    };
  }
  
  // Calculate the bounding box of all placed items
  calculateBoundingBox() {
    if (this.occupiedSpaces.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    this.occupiedSpaces.forEach(rect => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  // Calculate layout density
  calculateDensity() {
    const bbox = this.calculateBoundingBox();
    const totalArea = bbox.width * bbox.height;
    
    if (totalArea === 0) return 0;
    
    const occupiedArea = this.occupiedSpaces.reduce((sum, rect) => {
      return sum + (rect.width * rect.height);
    }, 0);
    
    return (occupiedArea / totalArea) * 100;
  }
  
  // Detect all collisions in current layout
  detectAllCollisions() {
    const collisions = [];
    
    for (let i = 0; i < this.occupiedSpaces.length; i++) {
      for (let j = i + 1; j < this.occupiedSpaces.length; j++) {
        if (this.detectCollision(
          this.occupiedSpaces[i],
          this.occupiedSpaces[j],
          this.SPACING.MINIMUM_PADDING
        )) {
          collisions.push({
            item1: i,
            item2: j,
            overlap: true
          });
        }
      }
    }
    
    return collisions;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutDesigner;
}

// Example usage
if (require.main === module) {
  const designer = new LayoutDesigner({
    minPadding: 50,
    horizontalGap: 250,
    verticalGap: 250
  });
  
  // Test tree layout
  const treeLayout = designer.calculateTreeLayout(
    { x: 1000, y: 500 },
    [
      [{ id: 'opp1' }, { id: 'opp2' }, { id: 'opp3' }],
      [{ id: 'sol1' }, { id: 'sol2' }, { id: 'sol3' }, { id: 'sol4' }]
    ]
  );
  
  console.log('Tree Layout:', treeLayout);
  console.log('Layout Report:', designer.generateLayoutReport());
}