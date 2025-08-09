# 🎯 Miro MCP - Continuous Discovery Habits Masterclass Board

A Model Context Protocol (MCP) server for Miro board management, specifically designed to recreate and maintain the "Continuous Discovery Habits Masterclass" workshop board based on Teresa Torres' methodology.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Miro API credentials (Access Token and Board ID)
- Claude Desktop or MCP-compatible client

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/Miro-MCP.git
cd Miro-MCP

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Miro credentials
```

### Environment Variables
```env
MIRO_ACCESS_TOKEN="your_miro_access_token"
MIRO_BOARD_ID="your_board_id"
```

## 📊 Board Structure

The board consists of 7 sections representing the continuous discovery process. See [board-structure-truth.md](board-structure-truth.md) for the complete Mermaid diagram.

### Section Overview
| Section | Title | Status | Missing Elements |
|---------|-------|--------|------------------|
| 0 | Continuous Discovery Habits | 90% | 3 yellow nodes, EXAMPLES panel |
| 1 | Defining Outcomes | 100% | 2 dark panel headers |
| 2 | **Interviewing** | **78%** | **ALL 7 subsection headers (critical)** |
| 3 | Mapping Opportunities | 100% | TREE label, EXAMPLES panel |
| 4 | Assessing & Prioritizing | 99% | 5 dark panel headers |
| 5 | Solution Story Mapping | 100% | EXAMPLES panel |
| 6 | Testing Assumptions | 100% | Header, EXAMPLES panel |

## 🛠️ Available Tools

### MCP Server Tools
- `list-boards` - List all accessible Miro boards
- `create-sticky` - Create a sticky note on a board
- `create-positioned-sticky` - Create sticky with precise positioning
- `bulk-create-stickies` - Batch create multiple sticky notes
- `get-board-items` - Get all items from a board
- `create-shape` - Create shapes (rectangle, circle, triangle)
- `create-text` - Create text items on a board
- `verify-board-positioning` - Verify spatial layout

### Analysis Scripts
```bash
# Comprehensive board audit against screenshots
node comprehensive-board-audit.js

# Spatial layout and overlap analysis
node spatial-layout-audit.js

# Verify subsection headers (critical for Section 2)
node subsection-verification.js

# Text and placement analysis
node analyze-placement-and-text.js
```

### Fix Scripts
```bash
# Complete board alignment
node execute-complete-fix.js

# Fix specific differences
node resolve-differences.js

# Fix overlapping items
node fix-layout-spacing.js

# Fix z-order layering
node fix-z-order-layering.js
```

## 📈 Current Board Status

### Overall Metrics
- **Sticky Notes**: 425/429 (99% complete)
- **Subsection Headers**: 11/32 (34% - **critical issue**)
- **Layout Quality**: Grade B (after fixes)
- **Color Accuracy**: 100%

### Critical Issues
1. **Section 2 (Interviewing)**: Missing ALL 7 subsection headers
   - WHO TO INTERVIEW
   - HOW TO RECRUIT
   - WHEN TO INTERVIEW
   - HOW TO INTERVIEW
   - WHAT TO CAPTURE
   - Main header
   - EXAMPLES panel

2. **Section 4**: Missing 5 organizational headers
3. **Multiple sections**: Missing EXAMPLES panels

## 📐 Board Specifications

### Layout Dimensions
```javascript
const LAYOUT = {
  sectionWidth: 1400,    // px per section
  sectionHeight: 3000,   // px height
  stickySize: 100,       // 100x100px
  spacing: 110,          // px between items
  padding: 50,           // px from edges
  headerHeight: 150      // px for headers
}
```

### Color System
```javascript
const COLORS = {
  yellow: 'yellow',           // Ideas, outcomes, stories
  green: 'light_green',       // Opportunities, flow nodes  
  purple: 'violet',           // Tasks
  darkBlue: 'dark_blue',      // Test labels
  pink: 'light_pink',         // Research notes
  blue: 'blue'                // Hierarchy nodes
}
```

## 📋 Key Documentation

### Structure Documentation
- **[board-structure-truth.md](board-structure-truth.md)** - Complete Mermaid diagram (source of truth)
- **[subsection-verification-report.json](subsection-verification-report.json)** - Missing headers analysis

### Execution Reports
- **[final-execution-summary.md](final-execution-summary.md)** - Latest fixes applied
- **[spatial-improvement-summary.md](spatial-improvement-summary.md)** - Layout improvements
- **[difference-report-summary.md](difference-report-summary.md)** - Comparison analysis

### Planning Documents
- **[comprehensive-cleanup-plan.md](comprehensive-cleanup-plan.md)** - Cleanup strategy
- **[difference-resolution-plan.md](difference-resolution-plan.md)** - Fix methodology
- **[swarm-orchestration-plan.md](swarm-orchestration-plan.md)** - Agent architecture

## 🤖 Claude-Flow Integration

This project supports claude-flow V2 for enhanced development:

```bash
# Start orchestration system
./claude-flow start --ui

# Run SPARC development modes
./claude-flow sparc "Add missing Section 2 headers"

# Use swarm coordination
./claude-flow swarm "Complete board structure" --strategy development --monitor
```

## 🚨 Known Limitations

### API Limitations
- Cannot add text labels directly (must use shapes with text)
- Cannot upload images (use placeholders)
- Z-index operations limited
- Rate limiting requires delays (200-500ms)

### Current Issues
1. **21 missing subsection headers** (34% complete)
2. Section 0 missing 3 yellow milestone nodes
3. Section 4 missing 1 sticky note (149/150)
4. Example galleries need manual image upload

## 📊 Section Details

### Section 2: Interviewing (Most Critical)
**Current State**: Structure incomplete
**Missing**: ALL organizational headers

Required structure:
```
2. INTERVIEWING
├── CONTINUOUS INTERVIEWING TO DISCOVER OPPORTUNITIES (header)
├── WHO TO INTERVIEW (dark panel) → 5 yellow stickies
├── HOW TO RECRUIT (dark panel) → 5 yellow stickies
├── WHEN TO INTERVIEW (dark panel) → 5 yellow stickies
├── HOW TO INTERVIEW (dark panel) → 5 yellow stickies
├── WHAT TO CAPTURE (dark panel) → 5 yellow stickies
├── 6 pink research notes
└── EXAMPLES (dark panel) → 6 images
```

## 🔧 Development

### Running the MCP Server
```bash
npm run build
npm start
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm run inspect
```

### Claude Desktop Configuration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "miro": {
      "command": "node",
      "args": ["/path/to/miro-mcp/dist/server.js"],
      "env": {
        "MIRO_ACCESS_TOKEN": "your_token",
        "MIRO_BOARD_ID": "your_board_id"
      }
    }
  }
}
```

## 📝 TODO Priority List

### 🔴 Critical (Section 2)
- [ ] Add 7 subsection headers to Interviewing section
- [ ] Create dark panel backgrounds for each subsection

### 🟡 High Priority
- [ ] Add 5 headers to Section 4
- [ ] Add 3 headers to Section 1
- [ ] Add main headers to Sections 1, 2, 4, 6

### 🟢 Medium Priority
- [ ] Add EXAMPLES panels to all sections
- [ ] Add 3 yellow nodes to Section 0
- [ ] Add 1 sticky to Section 4
- [ ] Create flow diagram structure

## 🤝 Contributing

1. Run comprehensive audit first
2. Focus on Section 2 (most critical)
3. Test changes with `subsection-verification.js`
4. Update board-structure-truth.md
5. Document all changes

## 📄 License

MIT License

## 🙏 Acknowledgments

- Teresa Torres - Continuous Discovery Habits methodology
- Miro - Collaboration platform and API
- Anthropic - Model Context Protocol framework

---

**Board URL**: https://miro.com/app/board/uXjVJVwIRGY=/  
**Last Updated**: August 8, 2025  
**Overall Completion**: 99% content, 34% headers