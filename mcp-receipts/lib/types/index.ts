export type ToolItem = {
  name: string;
  description?: string;
  inputSchema?: unknown;
};

export type ResourceItem = {
  name?: string;
  title?: string;
  uri: string;
  description?: string;
  mimeType?: string;
};

export type PromptItem = {
  name: string;
  description?: string;
  title?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
};

export type CatalogResponse = {
  tools: ToolItem[];
  resources: ResourceItem[];
  prompts: PromptItem[];
  resourceTemplates?: Array<{
    name?: string;
    uriTemplate?: string;
    description?: string;
  }>;
};

export type MenuKey = "tools" | "resources" | "prompts" | null;

export type SelectedContext =
  | { type: "tool"; name: string }
  | { type: "resource"; uri: string; title: string }
  | { type: "prompt"; name: string }
  | null;

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
      | "top-10-resource";