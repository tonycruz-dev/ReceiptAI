export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type MappedTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type SyntheticToolName =
  | "mcp_list_resources"
  | "mcp_read_resource"
  | "mcp_read_resource_template"
  | "mcp_list_prompts"
  | "mcp_get_prompt";

export type CleanReceipt = {
  id: string;
  shortId: string;
  merchantName: string;
  purchaseDate: string;
  totalAmount: number | string;
  currency: string;
  category: string;
  hasImage: boolean;
  imageUrl?: string | null;
};

export type ForcedToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type McpTool = Tool;
import type { Tool } from "@modelcontextprotocol/client";
