import { MappedTool, McpTool } from "./chat-types";

export function toGroqTools(mcpTools: McpTool[]): MappedTool[] {
  const nativeTools: MappedTool[] = mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || `MCP tool: ${tool.name}`,
      parameters:
        typeof tool.inputSchema === "object" && tool.inputSchema
          ? tool.inputSchema
          : {
              type: "object",
              properties: {},
              additionalProperties: true,
            },
    },
  }));

  const syntheticTools: MappedTool[] = [
    {
      type: "function",
      function: {
        name: "mcp_list_resources",
        description: "List available MCP resources from the backend.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "mcp_read_resource",
        description: "Read an MCP resource by exact URI.",
        parameters: {
          type: "object",
          properties: {
            uri: { type: "string" },
          },
          required: ["uri"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "mcp_read_resource_template",
        description: "Build and read an MCP resource URI from a template.",
        parameters: {
          type: "object",
          properties: {
            template: { type: "string" },
            values: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
          required: ["template", "values"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "mcp_list_prompts",
        description: "List available MCP prompts from the backend.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "mcp_get_prompt",
        description: "Get an MCP prompt by name.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string" },
            arguments: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
      },
    },
  ];

  return [...nativeTools, ...syntheticTools];
}
