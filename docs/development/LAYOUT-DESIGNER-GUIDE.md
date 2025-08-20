# Layout Designer Guide for Miro Board

## Overview
The Layout Designer module ensures that all stickies and elements on your Miro board are properly spaced with no overlaps. It provides collision detection, automatic positioning adjustment, and various layout algorithms.

## Problem Solved
- **Before**: Stickies placed on top of each other, requiring manual adjustment
- **After**: All elements automatically positioned with minimum 60px padding

## Quick Start

### 1. Import the Layout Designer

```javascript
const LayoutDesigner = require('./layout-designer');

// Initialize with configuration
const layoutDesigner = new LayoutDesigner({
  minPadding: 60,           // Minimum space between stickies
  horizontalGap: 280,        // Horizontal spacing
  verticalGap: 280,          // Vertical spacing
  connectorClearance: 40,    // Extra space for connectors
  useGrid: true,
  gridCellWidth: 350,
  gridCellHeight: 350
});
```

### 2. Use Before Placing Items

```javascript
// Reset for new layout calculation
layoutDesigner.reset();

// Calculate safe position for a single item
const safePos = layoutDesigner.findSafePosition(
  { x: 1000, y: 500 },  // desired position
  null,                  // dimensions (uses defaults)
  'square'               // shape
);

// Create sticky at safe position
await miroApi.post(`/boards/${boardId}/sticky_notes`, {
  data: { content: 'My content', shape: 'square' },
  position: safePos,
  style: { fillColor: 'yellow' }
});
```

## Layout Methods

### 1. Tree Layout (Teresa Torres Opportunity Solution Tree)

```javascript
const outcomePos = { x: 1400, y: 100 };
const opportunities = [
  {
    title: 'Opportunity 1',
    solutions: ['Solution A', 'Solution B'],
    experiments: ['Test 1']
  },
  // ... more opportunities
];

const layout = layoutDesigner.calculateOpportunitySolutionTree(
  outcomePos,
  opportunities
);

// Returns:
// {
//   outcome: { x, y },
//   opportunities: [{ opportunity, position }],
//   solutions: [{ solution, position }],
//   experiments: [{ experiment, position }]
// }
```

### 2. Grid Layout

```javascript
const items = [
  { content: 'Item 1', shape: 'square' },
  { content: 'Item 2', shape: 'square' },
  // ... more items
];

const layout = layoutDesigner.calculateGridLayout(
  { x: 1000, y: 1000 },  // start position
  items,                  // items to layout
  3                       // columns
);
```

### 3. Flow Layout

```javascript
const layout = layoutDesigner.calculateFlowLayout(
  { x: 1000, y: 1000 },  // start position
  items,                  // items to layout
  1200                    // max width before wrapping
);
```

### 4. Journey Layout

```javascript
const phases = [
  {
    title: 'Phase 1',
    keyMoments: [
      {
        moment: 'Key Moment 1',
        stories: ['Story A', 'Story B'],
        painPoints: ['Pain 1', 'Pain 2']
      }
    ]
  }
];

const layout = layoutDesigner.calculateJourneyLayout(
  { x: 2000, y: 2000 },  // frame position
  phases
);
```

## Collision Detection

```javascript
// Check if layout has overlaps
const report = layoutDesigner.generateLayoutReport();

if (report.collisions.length === 0) {
  console.log('✅ No overlaps detected!');
} else {
  console.log(`⚠️ ${report.collisions.length} overlaps found`);
}

// Report includes:
// - totalItems: number of positioned items
// - boundingBox: overall dimensions
// - density: space utilization percentage
// - collisions: array of overlapping pairs
```

## Integration with Swarm

The Layout Designer has been added to the swarm configuration as a specialized agent:

```json
{
  "name": "Layout_Designer",
  "type": "layout_specialist",
  "role": "Board Layout & Spacing Expert",
  "responsibilities": [
    "Calculate optimal positions for all stickies",
    "Ensure minimum 60px padding between elements",
    "Prevent overlapping of stickies and shapes",
    "Optimize visual hierarchy and flow",
    "Validate layouts before placement"
  ],
  "configuration": {
    "minimum_padding": 60,
    "horizontal_gap": 280,
    "vertical_gap": 280,
    "connector_clearance": 40,
    "grid_enabled": true
  }
}
```

## Best Practices

### 1. Always Reset Before New Layout
```javascript
layoutDesigner.reset();  // Clear tracking before new layout
```

### 2. Batch Position Calculations
```javascript
// Calculate all positions first
const positions = items.map(item => 
  layoutDesigner.findSafePosition(item.desiredPos, null, item.shape)
);

// Then create all items
for (const [index, pos] of positions.entries()) {
  await createSticky(items[index], pos);
}
```

### 3. Use Appropriate Layout Method
- **Tree structures**: Use `calculateOpportunitySolutionTree()`
- **Regular grids**: Use `calculateGridLayout()`
- **Text-heavy content**: Use `calculateFlowLayout()`
- **Process flows**: Use `calculateJourneyLayout()`

### 4. Validate Before Committing
```javascript
const report = layoutDesigner.generateLayoutReport();
if (report.collisions.length > 0) {
  console.warn('Layout has overlaps, adjusting...');
  // Implement fallback or adjustment logic
}
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `minPadding` | 50 | Minimum pixels between elements |
| `horizontalGap` | 250 | Standard horizontal spacing |
| `verticalGap` | 250 | Standard vertical spacing |
| `connectorClearance` | 30 | Extra space for connector lines |
| `useGrid` | true | Enable grid snapping |
| `gridCellWidth` | 300 | Grid cell width |
| `gridCellHeight` | 300 | Grid cell height |
| `snapToGrid` | true | Snap positions to grid |

## Example: Complete Implementation

```javascript
const LayoutDesigner = require('./layout-designer');

async function createProperlySpacedBoard() {
  const layoutDesigner = new LayoutDesigner({
    minPadding: 60,
    horizontalGap: 280,
    verticalGap: 280
  });
  
  // Reset for fresh calculation
  layoutDesigner.reset();
  
  // Define structure
  const structure = {
    outcome: 'Increase user engagement',
    opportunities: [
      { title: 'Simplify onboarding', solutions: ['Tutorial', 'Templates'] },
      { title: 'Improve navigation', solutions: ['Search', 'Shortcuts'] }
    ]
  };
  
  // Calculate layout
  const layout = layoutDesigner.calculateOpportunitySolutionTree(
    { x: 1400, y: 100 },
    structure.opportunities
  );
  
  // Create items with calculated positions
  for (const opportunity of layout.opportunities) {
    await createStickyNote(opportunity.position, opportunity.opportunity.title);
  }
  
  // Validate no overlaps
  const report = layoutDesigner.generateLayoutReport();
  console.log(`Created ${report.totalItems} items with ${report.collisions.length} overlaps`);
}
```

## Troubleshooting

### Items Still Overlapping
- Increase `minPadding` value
- Check if all items are tracked with `layoutDesigner.occupiedSpaces`
- Ensure `reset()` is called before each new layout

### Layout Too Spread Out
- Decrease `horizontalGap` and `verticalGap`
- Adjust grid cell dimensions
- Use flow layout for tighter packing

### Performance Issues
- Limit collision detection attempts (default: 20)
- Process items in batches
- Use grid layout for large item sets

## Files

- **layout-designer.js**: Core module with all layout algorithms
- **fix-layout-overlaps.js**: Script to fix existing overlaps
- **example-with-layout-designer.js**: Complete usage example
- **swarm-config.json**: Updated with Layout_Designer agent

## API Reference

See inline documentation in `layout-designer.js` for complete API details.

---

*Layout Designer ensures professional, readable Miro boards with zero overlapping elements.*