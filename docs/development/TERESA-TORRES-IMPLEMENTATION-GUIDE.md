# Teresa Torres Continuous Discovery Habits Implementation Guide

## Executive Summary

This guide provides the complete implementation roadmap for transforming the Miro board into a proper Teresa Torres Continuous Discovery Habits workspace using the Opportunity Solution Tree methodology.

## Current Status

⚠️ **API Access Issue Detected**
- Board ID: `uXjVJS1vI0k=`
- Error: 400 "Invalid parameters" 
- Token validation: Returns 0 accessible boards
- **Next Step**: Verify board access permissions and token scopes

## Implementation Overview

### Teresa Torres Color System
- **Blue (#2D9BF0)**: Desired Outcomes (top of tree)
- **Light Green (#8FD14F)**: Opportunities (from user research)
- **Yellow (#FEF445)**: Solution Ideas (under opportunities)
- **Dark Blue (#0062FF)**: Experiments (testing assumptions)

### Target Structure
```
┌─────────────────────────┐
│   PRIMARY OUTCOME       │ (Blue - position: 1400, 100)
└───────────┬─────────────┘
            │
    ┌───────┴────────┬──────────────┬───────────┐
    ▼                ▼              ▼           ▼
┌─────────┐    ┌─────────┐    ┌─────────┐ ┌─────────┐
│  OPP 1  │    │  OPP 2  │    │  OPP 3  │ │  OPP 4  │ (Light Green)
└────┬────┘    └────┬────┘    └────┬────┘ └────┬────┘
     │              │              │           │
   ┌─┴──┬──┐    ┌──┴──┐      ┌───┴───┐   ┌───┴───┐
   ▼    ▼  ▼    ▼     ▼      ▼       ▼   ▼       ▼
 [SOL] [SOL][SOL][SOL][SOL] [SOL]  [SOL][SOL]  [SOL] (Yellow)
   │                   │             │
   ▼                   ▼             ▼
 [TEST]              [TEST]        [TEST] (Dark Blue)
```

## PHASE 0: Framework Setup

### Step 0.1: Verify API Access
```bash
# Test board connection
node test-teresa-implementation.js
```

**Expected Issues to Resolve:**
1. **Board ID Format**: Verify `uXjVJS1vI0k=` is correct board ID from URL
2. **Token Scopes**: Ensure token has `boards:read` and `boards:write` permissions
3. **Board Permissions**: Confirm token owner has edit access to the board

### Step 0.2: Create Primary Outcome
```javascript
// MCP Server Tool: create-sticky
{
  boardId: "uXjVJS1vI0k=",
  text: "PRIMARY OUTCOME: Increase user engagement by 25% through improved discovery features",
  x: 1400,
  y: 100,
  color: "#2D9BF0"
}
```

### Step 0.3: Create Opportunity Structure
**Initial 6 Opportunities** (Light Green #8FD14F):
1. "Users struggle with feature discovery" (x: 800, y: 400)
2. "Onboarding lacks engagement hooks" (x: 1050, y: 400)
3. "Navigation feels overwhelming" (x: 1300, y: 400)
4. "Value proposition unclear" (x: 1550, y: 400)
5. "Habit formation missing" (x: 1800, y: 400)
6. "Feedback loops inadequate" (x: 2050, y: 400)

### Step 0.4: Create Connectors
```javascript
// Connect outcome to each opportunity
opportunities.forEach(oppId => {
  // MCP Tool: create-connector
  {
    boardId: "uXjVJS1vI0k=",
    startItemId: outcomeId,
    endItemId: oppId,
    style: "arrow"
  }
});
```

## PHASE 1: Blank Sticky Cleanup

### Current State Analysis
- **Total Items**: 404
- **Blank Stickies**: 197 (77% of stickies)
- **Target**: Remove blanks, keep structural placeholders

### Cleanup Strategy
```javascript
// MCP Tool: bulk-delete-items
{
  boardId: "uXjVJS1vI0k=",
  itemIds: [/* 197 blank sticky IDs */],
  batchSize: 10  // Respect rate limits
}
```

**Priority Sections:**
1. Section 0: 109 blank stickies
2. Section 1: 51 blank stickies
3. Scattered singles: 37 blank stickies

## PHASE 2: Content Population

### Solution Layer (Yellow #FEF445)
Add 3 solutions under each opportunity:

**Opportunity 1 Solutions:**
- "Guided tour feature" (x: 720, y: 600)
- "Interactive onboarding" (x: 800, y: 600) 
- "Progressive disclosure" (x: 880, y: 600)

**Opportunity 2 Solutions:**
- "Welcome video series" (x: 970, y: 600)
- "Achievement badges" (x: 1050, y: 600)
- "Personal progress tracking" (x: 1130, y: 600)

*[Continue pattern for all 6 opportunities]*

### Experiment Layer (Dark Blue #0062FF)
Add 1 experiment under first solution of each opportunity:

1. "A/B test tooltip vs modal" (x: 800, y: 800)
2. "User interview: navigation pain points" (x: 1050, y: 800)
3. "Heat map analysis" (x: 1300, y: 800)
4. "Prototype usability test" (x: 1550, y: 800)
5. "Survey: feature importance" (x: 1800, y: 800)
6. "Analytics: engagement metrics" (x: 2050, y: 800)

## PHASE 3: Relationship Mapping

### Connection Strategy
```javascript
// Create hierarchical connections
const connections = [
  // Outcome → Opportunities (6 connectors)
  { from: outcomeId, to: opp1Id },
  { from: outcomeId, to: opp2Id },
  // ... etc

  // Opportunities → Solutions (18 connectors) 
  { from: opp1Id, to: sol1Id },
  { from: opp1Id, to: sol2Id },
  // ... etc

  // Solutions → Experiments (6 connectors)
  { from: sol1Id, to: exp1Id },
  // ... etc
];

// Total: 30+ parent-child relationships
```

## PHASE 4: Quality Assurance

### Teresa Torres Compliance Checklist
- [ ] Single clear desired outcome at top
- [ ] 6+ opportunities from user research
- [ ] Each opportunity has 2-3 solution ideas
- [ ] Riskiest assumptions identified as experiments
- [ ] Clear parent-child relationships throughout
- [ ] Color coding follows methodology

### Metrics Validation
- [ ] 80%+ fill rate achieved
- [ ] 30+ connector relationships
- [ ] Proper spatial hierarchy (top-down)
- [ ] Color-purpose alignment verified

## MCP Server Tools Reference

### Available Tools (Enhanced)
1. `get-board-items` - Fetch current board state
2. `create-sticky` - Create individual sticky notes
3. `delete-item` - Remove single items
4. `bulk-delete-items` - Batch delete with rate limiting
5. `update-item` - Modify position, content, color
6. `create-connector` - Add relationship arrows
7. `create-opportunity-solution-tree` - Teresa Torres specific tool

### Usage Examples

#### Create Opportunity Solution Tree
```javascript
// MCP Tool: create-opportunity-solution-tree
{
  boardId: "uXjVJS1vI0k=",
  outcomeText: "Increase user engagement by 25%",
  opportunities: [
    "Users struggle with feature discovery",
    "Onboarding lacks engagement hooks",
    "Navigation feels overwhelming",
    // ... etc
  ]
}
```

#### Bulk Operations
```javascript
// Delete blank stickies
{
  boardId: "uXjVJS1vI0k=", 
  itemIds: ["id1", "id2", "id3", ...],
  batchSize: 10
}
```

## Troubleshooting Guide

### API Access Issues

#### Error: 400 "Invalid parameters"
**Possible Causes:**
1. Board ID format incorrect
2. Token lacks required scopes
3. User doesn't have board edit permissions

**Solutions:**
1. Verify board ID from URL: `https://miro.com/app/board/{BOARD_ID}/`
2. Check token scopes include: `boards:read`, `boards:write`
3. Ensure token owner is board collaborator

#### Error: 0 accessible boards
**Cause:** Token permissions insufficient
**Solution:** Regenerate token with proper scopes

### Rate Limiting
- **Limit**: 60 requests/minute
- **Strategy**: 200ms delays between operations
- **Batch Size**: Max 10 items per batch

### Connection Failures
- **Common Issue**: Item IDs change after creation
- **Solution**: Store IDs from creation responses
- **Retry Logic**: Exponential backoff for failed connections

## Alternative Implementation (If API Issues Persist)

### Manual Implementation Steps
1. **Open Board**: https://miro.com/app/board/uXjVJS1vI0k=/
2. **Create Primary Outcome**: 
   - Add blue sticky at top center
   - Text: "PRIMARY OUTCOME: Increase user engagement by 25%"
3. **Add 6 Opportunities**:
   - Light green stickies in horizontal row below outcome
   - Connect each to outcome with arrows
4. **Add Solutions**:
   - Yellow stickies (3 per opportunity)
   - Position below each opportunity
5. **Add Experiments**:
   - Dark blue stickies below solutions
   - Focus on riskiest assumptions

### Verification Checklist
- [ ] Tree structure flows top-down
- [ ] All items properly connected
- [ ] Colors match Teresa Torres system
- [ ] Content follows methodology principles

## Success Metrics

### Quantitative Goals
- [ ] 1 Primary Outcome (blue)
- [ ] 6+ Opportunities (light green)
- [ ] 18+ Solutions (yellow)
- [ ] 6+ Experiments (dark blue)
- [ ] 30+ Connectors (parent-child)
- [ ] 80% board fill rate

### Qualitative Goals (Teresa Torres Aligned)
- [ ] Clear outcome-opportunity-solution flow
- [ ] Every solution traces to an opportunity
- [ ] Every opportunity traces to outcome
- [ ] Riskiest assumptions identified and tested
- [ ] Team-wide understanding of discovery map

## Next Steps

### Immediate Actions
1. **Resolve API Access**: 
   - Verify board ID format
   - Check token permissions
   - Test basic board access

2. **Execute Implementation**:
   - Run MCP server tools
   - Or use manual implementation approach

3. **Validate Results**:
   - Check Teresa Torres compliance
   - Verify all connections
   - Test board usability

### Ongoing Maintenance
- **Weekly Updates**: Add new research insights
- **Monthly Reviews**: Validate opportunity-solution mapping
- **Quarterly Audits**: Ensure methodology compliance

---

## Appendix

### API Endpoint Reference
```
GET /boards/{boardId}/items          # Fetch board items
POST /boards/{boardId}/sticky_notes  # Create sticky note  
DELETE /boards/{boardId}/items/{id}  # Delete item
PATCH /boards/{boardId}/items/{id}   # Update item
POST /boards/{boardId}/connectors    # Create connector
```

### Board Information
- **URL**: https://miro.com/app/board/uXjVJS1vI0k=/
- **Current Items**: 404 total
- **Blank Stickies**: 197 to remove
- **Populated Items**: 59 to preserve/enhance

### Teresa Torres Methodology References
> "Visual thinking frees up mental energy, offloading some memory into external displays and taking advantage of the human capacity to recognize patterns."

> "The best product teams make decisions based on what they are learning from their customers on a regular cadence."

> "Every solution should trace back to an opportunity, and every opportunity should trace back to the desired outcome."

---

**Document Created**: August 19, 2025  
**Implementation Status**: Ready for API access resolution  
**Methodology**: Teresa Torres - Continuous Discovery Habits