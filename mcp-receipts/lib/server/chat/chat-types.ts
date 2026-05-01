export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type SelectedContext =
  | { type: "tool"; name: string }
  | { type: "resource"; uri: string; title?: string }
  | { type: "prompt"; name: string }
  | null;

export type ActionPayload =
  | {
      action: "create-receipt-from-image";
      imageUrl: string;
      imagePublicId: string;
    }
  | {
      action: "receipts-by-category";
      category: string;
    }
  | {
      action: "receipts-by-id";
      receiptId: string;
    }
  | {
      action: "recent-count";
      count: number;
    }
  | {
      action: "top-10-resource";
      count: number;
    }
  | {
      action: "receipts-by-date-range";
      startDate: string;
      endDate: string;
    }
  | {
      action: "receipts-by-date";
      date: string;
    }
  | {
      action: "receipts-this-month";
    }
  | {
      action: "receipts-paged";
      pageNumber: number;
      pageSize: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type McpTool = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type McpPrompt = any;
