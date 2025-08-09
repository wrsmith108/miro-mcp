# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Miro MCP (Model Context Protocol) server project for integrating Miro whiteboards with Claude Desktop. The project uses TypeScript with the official MCP SDK and is integrated with claude-flow V2 and claude-organize for enhanced development capabilities.

## Enhanced Tools Integration

### Claude-Organize (File Organization)
- **Automatic file organization** is enabled via PostToolUse hooks
- Files created by Claude Code will be automatically organized into appropriate directories
- Use `/enhance` command to improve prompts with project context
- Example: `/enhance fix the broken tests` will include relevant CLAUDE.md rules

### Claude-Flow V2 (AI Orchestration)
- **Version**: v2.0.0-alpha.86
- Full SPARC development modes and swarm coordination available
- Integrated with claude-organize for comprehensive development workflow

## Project Setup & Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Development
npm run dev    # Run with tsx watch mode
npm run build  # Compile TypeScript
npm run test   # Run tests
npm start      # Run compiled server

# MCP Inspector for testing
npm run inspect

# Build and run
npm run build && npm start
```

### Claude-Flow V2 Commands
```bash
# System orchestration
claude-flow start --ui           # Start with web UI
claude-flow status              # Check system status
claude-flow monitor             # Real-time monitoring

# SPARC development modes
claude-flow sparc "Add connector support to Miro server"
claude-flow sparc tdd "Board item bulk operations"
claude-flow sparc run coder "Implement OAuth token refresh"
claude-flow sparc run reviewer "Audit Miro API security"

# Swarm coordination for complex tasks
claude-flow swarm "Implement complete Miro API coverage" --strategy development --mode hierarchical --max-agents 5 --monitor

# Memory management for project state
claude-flow memory store "miro_oauth_config" "OAuth configuration details"
claude-flow memory get "miro_oauth_config"
```

## Project Structure
```
/Users/williamsmith/Documents/GitHub/Miro-MCP/
├── src/
│   └── server.ts          # Main MCP server implementation
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Example environment configuration
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md            # Project documentation
├── CLAUDE.md            # Claude Code guidance
└── .claude-flow/        # Claude-flow configuration

```

## Architecture & Implementation Strategy

### Core Components
1. **MCP Server**: Handles JSON-RPC 2.0 communication over stdio with Claude Desktop
2. **Miro API Client**: Manages OAuth 2.0 authentication and REST API calls to Miro
3. **Tools**: Implement board operations (create/read/update items)
4. **Resources**: Expose board data through MCP resource URIs

### Essential Tools to Implement
- `list_boards`: Retrieve all accessible Miro boards
- `get_board_items`: Fetch items from a specific board
- `create_sticky_note`: Add sticky notes to boards
- `create_shape`: Add shapes (rectangles, circles, etc.)
- `create_text`: Add text items
- `update_item`: Modify existing board items
- `bulk_create_items`: Efficiently create multiple items

### Resource URIs
- `miro://boards` - List all boards
- `miro://boards/{boardId}` - Board metadata
- `miro://boards/{boardId}/items` - Board contents

## Miro API Integration

### Authentication Setup
1. Create a Miro app at https://miro.com/app-dev/
2. Configure OAuth 2.0 with appropriate scopes (`boards:read`, `boards:write`)
3. Store access token in environment variable: `MIRO_ACCESS_TOKEN`

### Key API Endpoints
- Boards: `GET/POST https://api.miro.com/v2/boards`
- Sticky Notes: `POST /boards/{board_id}/sticky_notes`
- Shapes: `POST /boards/{board_id}/shapes`
- Bulk Operations: `POST /boards/{board_id}/items/bulk`

## Claude Desktop Configuration
Configure MCP server in `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "miro": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {
        "MIRO_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

## Implementation References
- **TypeScript Example**: @evalstate/mcp-miro (comprehensive board manipulation)
- **Python Example**: @LuotoCompany/mcp-server-miro (uses FastMCP framework)
- **MCP SDK Documentation**: https://github.com/modelcontextprotocol/sdk

## Development Best Practices
- Use stderr for logging (stdout is reserved for JSON-RPC)
- Implement exponential backoff for API rate limiting (429 responses)
- Cache board metadata with TTL-based invalidation
- Validate all inputs to prevent injection attacks
- Never log OAuth tokens or sensitive data
- Include correlation IDs in logs for request tracing

## Testing Strategy
1. Unit tests for individual tool functions
2. Integration tests with mock Miro API responses
3. End-to-end testing using MCP Inspector
4. Manual testing with Claude Desktop integration

## Error Handling Priorities
- Invalid/expired OAuth tokens: Clear error messages with re-authentication guidance
- Permission issues: Validate user access before operations
- Rate limiting: Implement queuing and backoff strategies
- Invalid IDs: Provide helpful error messages with validation

## Next Implementation Steps
1. Choose implementation language (TypeScript recommended for type safety)
2. Set up project structure with chosen SDK
3. Implement OAuth token management
4. Create basic board listing tool
5. Add sticky note creation tool
6. Expand to full feature set
7. Add comprehensive error handling
8. Package for distribution (npm/PyPI)