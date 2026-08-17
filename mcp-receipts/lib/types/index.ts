export type JsonSchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
};

export type McpTool = {
  kind: "tool";
  name: string;
  title?: string;
  description?: string;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
};

export type McpStaticResource = {
  kind: "resource";
  name: string;
  title?: string;
  uri: string;
  description?: string;
  mimeType?: string;
};

export type McpResourceTemplate = {
  kind: "resourceTemplate";
  name: string;
  title?: string;
  uriTemplate: string;
  description?: string;
  mimeType?: string;
  variables: string[];
};

export type McpPromptArgument = {
  name: string;
  description?: string;
  required: boolean;
};

export type McpPrompt = {
  kind: "prompt";
  name: string;
  title?: string;
  description?: string;
  arguments: McpPromptArgument[];
};

export type McpSelection =
  | McpTool
  | McpStaticResource
  | McpResourceTemplate
  | McpPrompt;

export type CatalogResponse = {
  endpoint?: string;
  tools: McpTool[];
  resources: McpStaticResource[];
  resourceTemplates: McpResourceTemplate[];
  prompts: McpPrompt[];
};

export type ToolCallRequest = {
  name: string;
  arguments: Record<string, unknown>;
  confirmed?: boolean;
};

export type ResourceReadRequest = {
  uri: string;
};

export type PromptGetRequest = {
  name: string;
  arguments?: Record<string, string>;
};

export type McpContent = {
  type: string;
  text?: string;
  data?: string;
  mimeType?: string;
  [key: string]: unknown;
};

export type McpPromptMessage = {
  role: "user" | "assistant";
  content: McpContent;
};

export type PromptGetResponse = {
  kind: "prompt";
  name: string;
  description?: string;
  messages: McpPromptMessage[];
};

export type MenuKey = "tools" | "resources" | "prompts" | null;

export type ReceiptCardData = {
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

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  toolData?: {
    receipts?: ReceiptCardData[];
  } | null;
};

export type QuickActionType =
  | "create-receipt-from-image"
  | "summary"
  | "recent-receipts"
  | "receipts-by-category"
  | "receipts-by-date-range"
  | "receipts-by-date"
  | "receipts-by-id"
  | "recent-count"
  | "top-10-resource"
  | "receipts-this-month"
  | "receipts-paged";
