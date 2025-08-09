#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from "zod";
import axios from 'axios';
import * as dotenv from 'dotenv';

// Positioning Framework
class BoardLayout {
  constructor(boardId: string) {
    this.boardId = boardId;
    this.sectionWidth = 1400;
    this.sectionHeight = 1800;
    this.workAreaHeight = 1200;
    this.examplesHeight = 600;
    this.padding = 50;
    this.stickySize = { width: 100, height: 100 };
    this.gridGap = 10;
  }

  boardId: string;
  sectionWidth: number;
  sectionHeight: number;
  workAreaHeight: number;
  examplesHeight: number;
  padding: number;
  stickySize: { width: number; height: number };
  gridGap: number;

  getSectionPosition(sectionIndex: number) {
    return {
      x: sectionIndex * this.sectionWidth,
      y: 0
    };
  }

  getStickyPosition(sectionIndex: number, row: number, col: number) {
    const section = this.getSectionPosition(sectionIndex);
    return {
      x: section.x + this.padding + (col * (this.stickySize.width + this.gridGap)),
      y: section.y + 100 + (row * (this.stickySize.height + this.gridGap))
    };
  }

  getExamplesPosition(sectionIndex: number) {
    const section = this.getSectionPosition(sectionIndex);
    return {
      x: section.x,
      y: this.workAreaHeight
    };
  }

  getSectionHeaderPosition(sectionIndex: number) {
    const section = this.getSectionPosition(sectionIndex);
    return {
      x: section.x + this.sectionWidth / 2,
      y: section.y + 30
    };
  }
}

// Color System
class ColorSystem {
  static readonly COLORS = {
    darkBg: '#424867',
    lightBg: '#F5F5F5',
    yellow: '#FFF740',
    green: '#A6E3A1',
    purple: '#CBA6F7',
    pink: '#F5C2E7',
    darkBlue: '#424867'
  };

  static getTextColor(bgColor: string): string {
    const rgb = this.hexToRgb(bgColor);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static getColorByType(type: 'general' | 'story' | 'category' | 'opportunity' | 'interview'): string {
    const colorMap = {
      general: this.COLORS.yellow,
      story: this.COLORS.purple,
      category: this.COLORS.darkBlue,
      opportunity: this.COLORS.green,
      interview: this.COLORS.pink
    };
    return colorMap[type] || this.COLORS.yellow;
  }
}

// Board Verification
class BoardVerification {
  constructor(private boardId: string) {
    this.errors = [];
    this.warnings = [];
  }

  errors: string[];
  warnings: string[];

  isInSection(position: { x: number; y: number }, sectionIndex: number): boolean {
    const expectedX = sectionIndex * 1400;
    return position.x >= expectedX && position.x < expectedX + 1400;
  }

  hasProperContrast(bgColor: string, textColor: string): boolean {
    const bg = ColorSystem.hexToRgb(bgColor);
    const text = ColorSystem.hexToRgb(textColor);
    
    if (!bg || !text) return false;
    
    // Calculate relative luminance
    const getBrightness = (r: number, g: number, b: number) => {
      return (r * 299 + g * 587 + b * 114) / 1000;
    };
    
    const bgBrightness = getBrightness(bg.r, bg.g, bg.b);
    const textBrightness = getBrightness(text.r, text.g, text.b);
    
    const ratio = Math.abs(bgBrightness - textBrightness) / 255;
    return ratio >= 0.5; // Simplified contrast check
  }
}

// Load environment variables
dotenv.config();

// Initialize MCP server
const server = new McpServer({
  name: "miro-mcp-server",
  version: "1.0.0"
});

// Configure Miro API client
const miroApi = axios.create({
  baseURL: 'https://api.miro.com/v2',
  headers: {
    'Authorization': `Bearer ${process.env.MIRO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Tool: List all boards
server.tool(
  'list-boards',
  'List all accessible Miro boards',
  {},
  async () => {
    try {
      const response = await miroApi.get('/boards');
      const boards = response.data.data.map((board: any) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        viewLink: board.viewLink
      }));
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(boards, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error fetching boards: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create sticky note with positioning framework
server.tool(
  'create-sticky',
  'Create a sticky note on a Miro board',
  {
    boardId: z.string().describe("The ID of the board"),
    text: z.string().describe("Text content for the sticky note"),
    x: z.number().optional().describe("X coordinate"),
    y: z.number().optional().describe("Y coordinate"),
    color: z.string().optional().describe("Color of the sticky note (e.g., 'yellow', 'blue', 'green')"),
    colorType: z.enum(['general', 'story', 'category', 'opportunity', 'interview']).optional().describe("Color type from the design system")
  },
  async (args) => {
    try {
      const color = args.colorType ? ColorSystem.getColorByType(args.colorType) : (args.color || ColorSystem.COLORS.yellow);
      const textColor = ColorSystem.getTextColor(color);
      
      const response = await miroApi.post(`/boards/${args.boardId}/sticky_notes`, {
        data: {
          content: args.text
        },
        position: { 
          x: args.x || 0, 
          y: args.y || 0 
        },
        style: {
          fillColor: color,
          textColor: textColor
        }
      });
      
      return {
        content: [{
          type: "text",
          text: `Created sticky note with ID: ${response.data.id} at position (${args.x || 0}, ${args.y || 0}) with color ${color}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating sticky note: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Get board items
server.tool(
  'get-board-items',
  'Get all items from a Miro board',
  {
    boardId: z.string().describe("The ID of the board")
  },
  async (args) => {
    try {
      const response = await miroApi.get(`/boards/${args.boardId}/items`);
      const items = response.data.data;
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(items, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error fetching board items: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create shape
server.tool(
  'create-shape',
  'Create a shape on a Miro board',
  {
    boardId: z.string().describe("The ID of the board"),
    shapeType: z.enum(['rectangle', 'circle', 'triangle', 'round_rectangle']).describe("Type of shape"),
    x: z.number().optional().describe("X coordinate"),
    y: z.number().optional().describe("Y coordinate"),
    width: z.number().optional().describe("Width of the shape"),
    height: z.number().optional().describe("Height of the shape"),
    color: z.string().optional().describe("Fill color")
  },
  async (args) => {
    try {
      const response = await miroApi.post(`/boards/${args.boardId}/shapes`, {
        data: {
          shape: args.shapeType
        },
        position: { 
          x: args.x || 0, 
          y: args.y || 0 
        },
        geometry: {
          width: args.width || 100,
          height: args.height || 100
        },
        style: {
          fillColor: args.color || '#1a85ff'
        }
      });
      
      return {
        content: [{
          type: "text",
          text: `Created shape with ID: ${response.data.id}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating shape: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create text
server.tool(
  'create-text',
  'Create a text item on a Miro board',
  {
    boardId: z.string().describe("The ID of the board"),
    text: z.string().describe("Text content"),
    x: z.number().optional().describe("X coordinate"),
    y: z.number().optional().describe("Y coordinate"),
    fontSize: z.number().optional().describe("Font size")
  },
  async (args) => {
    try {
      const response = await miroApi.post(`/boards/${args.boardId}/texts`, {
        data: {
          content: args.text
        },
        position: { 
          x: args.x || 0, 
          y: args.y || 0 
        },
        style: {
          fontSize: args.fontSize || 14
        }
      });
      
      return {
        content: [{
          type: "text",
          text: `Created text item with ID: ${response.data.id}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating text: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create positioned sticky note
server.tool(
  'create-positioned-sticky',
  'Create a sticky note using the positioning framework (section-based)',
  {
    boardId: z.string().describe("The ID of the board"),
    text: z.string().describe("Text content for the sticky note"),
    sectionIndex: z.number().min(0).max(6).describe("Section index (0-6)"),
    row: z.number().min(0).describe("Row within section"),
    col: z.number().min(0).describe("Column within section"),
    colorType: z.enum(['general', 'story', 'category', 'opportunity', 'interview']).optional().describe("Color type from the design system")
  },
  async (args) => {
    try {
      const layout = new BoardLayout(args.boardId);
      const position = layout.getStickyPosition(args.sectionIndex, args.row, args.col);
      const color = ColorSystem.getColorByType(args.colorType || 'general');
      const textColor = ColorSystem.getTextColor(color);
      
      const response = await miroApi.post(`/boards/${args.boardId}/sticky_notes`, {
        data: {
          content: args.text
        },
        position,
        style: {
          fillColor: color,
          textColor: textColor
        }
      });
      
      return {
        content: [{
          type: "text",
          text: `Created positioned sticky note with ID: ${response.data.id} in section ${args.sectionIndex} at grid position (${args.row}, ${args.col})`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating positioned sticky note: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create section header
server.tool(
  'create-section-header',
  'Create a section header using the positioning framework',
  {
    boardId: z.string().describe("The ID of the board"),
    sectionIndex: z.number().min(0).max(6).describe("Section index (0-6)"),
    title: z.string().describe("Section title"),
    description: z.string().optional().describe("Section description")
  },
  async (args) => {
    try {
      const layout = new BoardLayout(args.boardId);
      const position = layout.getSectionHeaderPosition(args.sectionIndex);
      
      // Create section background
      const bgResponse = await miroApi.post(`/boards/${args.boardId}/shapes`, {
        data: {
          shape: 'rectangle'
        },
        position: {
          x: position.x - 650, // Center the background
          y: position.y - 20
        },
        geometry: {
          width: layout.sectionWidth - 100,
          height: 80
        },
        style: {
          fillColor: ColorSystem.COLORS.lightBg,
          borderColor: ColorSystem.COLORS.darkBg,
          borderWidth: 2
        }
      });
      
      // Create title text
      const titleResponse = await miroApi.post(`/boards/${args.boardId}/texts`, {
        data: {
          content: `<p><strong>${args.title}</strong></p>${args.description ? `<p>${args.description}</p>` : ''}`
        },
        position,
        style: {
          fontSize: 16,
          textAlign: 'center',
          color: ColorSystem.COLORS.darkBg
        }
      });
      
      return {
        content: [{
          type: "text",
          text: `Created section ${args.sectionIndex} header: ${args.title} (Background ID: ${bgResponse.data.id}, Text ID: ${titleResponse.data.id})`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating section header: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Bulk create sticky notes
server.tool(
  'bulk-create-stickies',
  'Create multiple sticky notes efficiently using bulk operations',
  {
    boardId: z.string().describe("The ID of the board"),
    items: z.array(z.object({
      text: z.string(),
      sectionIndex: z.number().min(0).max(6),
      row: z.number().min(0),
      col: z.number().min(0),
      colorType: z.enum(['general', 'story', 'category', 'opportunity', 'interview']).optional()
    })).describe("Array of sticky note items to create")
  },
  async (args) => {
    try {
      const layout = new BoardLayout(args.boardId);
      const bulkItems = args.items.map(item => {
        const position = layout.getStickyPosition(item.sectionIndex, item.row, item.col);
        const color = ColorSystem.getColorByType(item.colorType || 'general');
        const textColor = ColorSystem.getTextColor(color);
        
        return {
          data: {
            content: item.text,
            shape: 'square'
          },
          position,
          style: {
            fillColor: color,
            textColor: textColor
          }
        };
      });
      
      // Create items in batches of 50 to avoid API limits
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < bulkItems.length; i += batchSize) {
        const batch = bulkItems.slice(i, i + batchSize);
        const response = await miroApi.post(`/boards/${args.boardId}/sticky_notes/bulk`, {
          data: batch
        });
        results.push(...response.data.data);
        
        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < bulkItems.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return {
        content: [{
          type: "text",
          text: `Successfully created ${results.length} sticky notes using bulk operations`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error in bulk create operation: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Create layout template for continuous discovery board
server.tool(
  'create-discovery-layout',
  'Create the complete 7-section layout for Continuous Discovery Habits board',
  {
    boardId: z.string().describe("The ID of the board"),
    createHeaders: z.boolean().optional().describe("Whether to create section headers (default: true)")
  },
  async (args) => {
    try {
      const sections = [
        { index: 0, title: "Section 0", description: "Continuous Discovery" },
        { index: 1, title: "Section 1", description: "Defining Outcomes" },
        { index: 2, title: "Section 2", description: "Interviewing" },
        { index: 3, title: "Section 3", description: "Mapping Opportunities" },
        { index: 4, title: "Section 4", description: "Assessing & Prioritizing" },
        { index: 5, title: "Section 5", description: "Story Mapping" },
        { index: 6, title: "Section 6", description: "Testing Assumptions" }
      ];

      const results = [];
      
      if (args.createHeaders !== false) {
        for (const section of sections) {
          try {
            const layout = new BoardLayout(args.boardId);
            const position = layout.getSectionHeaderPosition(section.index);
            
            // Create section background
            const bgResponse = await miroApi.post(`/boards/${args.boardId}/shapes`, {
              data: {
                shape: 'rectangle'
              },
              position: {
                x: position.x - 650,
                y: position.y - 20
              },
              geometry: {
                width: layout.sectionWidth - 100,
                height: 80
              },
              style: {
                fillColor: ColorSystem.COLORS.lightBg,
                borderColor: ColorSystem.COLORS.darkBg,
                borderWidth: 2
              }
            });
            
            // Create title text
            const titleResponse = await miroApi.post(`/boards/${args.boardId}/texts`, {
              data: {
                content: `<p><strong>${section.title}</strong></p><p>${section.description}</p>`
              },
              position,
              style: {
                fontSize: 16,
                textAlign: 'center',
                color: ColorSystem.COLORS.darkBg
              }
            });
            
            results.push(`Section ${section.index}: ${section.title} (BG: ${bgResponse.data.id}, Text: ${titleResponse.data.id})`);
            
            // Small delay between sections
            await new Promise(resolve => setTimeout(resolve, 50));
            
          } catch (sectionError: any) {
            results.push(`Error creating section ${section.index}: ${sectionError.message}`);
          }
        }
      }
      
      return {
        content: [{
          type: "text",
          text: `Created continuous discovery layout:\n${results.join('\n')}`
        }]
      };
      
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error creating discovery layout: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Verify board positioning
server.tool(
  'verify-board-positioning',
  'Verify that board items follow the positioning framework',
  {
    boardId: z.string().describe("The ID of the board"),
    sectionIndex: z.number().min(0).max(6).optional().describe("Specific section to verify (optional)")
  },
  async (args) => {
    try {
      const verification = new BoardVerification(args.boardId);
      const response = await miroApi.get(`/boards/${args.boardId}/items`);
      const items = response.data.data;
      
      const results: string[] = [];
      const warnings: string[] = [];
      
      if (args.sectionIndex !== undefined) {
        // Verify specific section
        const sectionItems = items.filter((item: any) => 
          verification.isInSection(item.position, args.sectionIndex!)
        );
        
        results.push(`Section ${args.sectionIndex}: Found ${sectionItems.length} items`);
        
        // Check text contrast for each item
        sectionItems.forEach((item: any) => {
          if (item.style?.fillColor && item.style?.textColor) {
            if (!verification.hasProperContrast(item.style.fillColor, item.style.textColor)) {
              warnings.push(`Item ${item.id} may have poor contrast (${item.style.fillColor}/${item.style.textColor})`);
            }
          }
        });
        
      } else {
        // Verify all sections
        for (let i = 0; i <= 6; i++) {
          const sectionItems = items.filter((item: any) => 
            verification.isInSection(item.position, i)
          );
          results.push(`Section ${i}: ${sectionItems.length} items`);
        }
      }
      
      const report = [
        `Board Positioning Verification Report`,
        `Total items: ${items.length}`,
        ``,
        ...results
      ];
      
      if (warnings.length > 0) {
        report.push(``, `Warnings:`, ...warnings);
      }
      
      return {
        content: [{
          type: "text",
          text: report.join('\n')
        }]
      };
      
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `Error verifying board positioning: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Get color system info
server.tool(
  'get-color-system',
  'Get information about the color system and available colors',
  {},
  async () => {
    const colorInfo = {
      colors: ColorSystem.COLORS,
      colorTypes: {
        'general': 'Yellow - for general purpose sticky notes',
        'story': 'Purple - for story mapping cards',
        'category': 'Dark Blue - for category headers',
        'opportunity': 'Green - for opportunity mapping',
        'interview': 'Pink - for interview questions'
      },
      usage: 'Use colorType parameter in tools for automatic color selection and proper text contrast'
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(colorInfo, null, 2)
      }]
    };
  }
);

// Resource: List boards
server.resource(
  'boards',
  'miro://boards',
  async () => {
    try {
      const response = await miroApi.get('/boards');
      const boards = response.data.data;
      
      return {
        contents: [{
          uri: 'miro://boards',
          mimeType: 'application/json',
          text: JSON.stringify(boards, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        contents: [{
          uri: 'miro://boards',
          mimeType: 'text/plain',
          text: `Error fetching boards: ${error.message}`
        }]
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error("Miro MCP Server started");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});