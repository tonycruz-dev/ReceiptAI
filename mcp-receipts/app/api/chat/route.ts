import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

export const runtime = "nodejs";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type SelectedContext =
  | { type: "tool"; name: string }
  | { type: "resource"; uri: string; title?: string }
  | { type: "prompt"; name: string }
  | null;

type ActionPayload =
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
    };

type MappedTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type SyntheticToolName =
  | "mcp_list_resources"
  | "mcp_read_resource"
  | "mcp_read_resource_template"
  | "mcp_list_prompts"
  | "mcp_get_prompt";

type CleanReceipt = {
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

type ForcedToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type McpTool = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
type McpResource = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type McpPrompt = any;

async function createMcpClient() {
  const serverUrl = process.env.MCP_SERVER_URL;

  if (!serverUrl) {
    throw new Error("Missing MCP_SERVER_URL");
  }

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl));

  const client = new Client({
    name: "receipt-assistant-chat",
    version: "1.0.0",
  });

  await client.connect(transport);
  return client;
}

function toGroqTools(mcpTools: McpTool[]): MappedTool[] {
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
            uri: {
              type: "string",
              description: "The exact MCP resource URI to read.",
            },
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
        description:
          "Build and read an MCP resource URI from a template and template values.",
        parameters: {
          type: "object",
          properties: {
            template: {
              type: "string",
              description: "A URI template such as receipt://date/{from}/{to}",
            },
            values: {
              type: "object",
              description:
                "Template values used to replace placeholders in the URI template.",
              additionalProperties: {
                type: "string",
              },
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
        description:
          "Get an MCP prompt by name, optionally with string arguments.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The prompt name.",
            },
            arguments: {
              type: "object",
              description: "Optional string arguments for the prompt.",
              additionalProperties: {
                type: "string",
              },
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

function parseToolArguments(args: string | undefined): Record<string, unknown> {
  if (!args) return {};

  try {
    const parsed = JSON.parse(args);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

function toPromptArguments(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const result: Record<string, string> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (raw == null) continue;

    if (typeof raw === "string") {
      result[key] = raw;
    } else if (
      typeof raw === "number" ||
      typeof raw === "boolean" ||
      raw instanceof Date
    ) {
      result[key] = String(raw);
    } else {
      result[key] = JSON.stringify(raw);
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function shortenId(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 8) : "";
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryExtractStructuredResult(result: any): any {
  if (!result) return null;

  if (result.structuredContent) {
    return result.structuredContent;
  }

  if (Array.isArray(result.content)) {
    const textItem = result.content.find(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "text" in item &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).type === "text",
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (textItem as any)?.text;
    if (typeof text === "string") {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isReceiptLike(item: any): boolean {
  return (
    item &&
    typeof item === "object" &&
    ("merchantName" in item ||
      "purchaseDate" in item ||
      "totalAmount" in item ||
      "imageUrl" in item)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractReceiptArray(structured: any): any[] | null {
  if (!structured) return null;

  if (Array.isArray(structured) && structured.every(isReceiptLike)) {
    return structured;
  }

  if (
    typeof structured === "object" &&
    structured !== null &&
    Array.isArray(structured.result) &&
    structured.result.every(isReceiptLike)
  ) {
    return structured.result;
  }

  if (
    typeof structured === "object" &&
    structured !== null &&
    isReceiptLike(structured.result)
  ) {
    return [structured.result];
  }

  if (isReceiptLike(structured)) {
    return [structured];
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryParseJson(value: any): any | null {
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractReceiptsFromUnknown(value: any): any[] | null {
  if (!value) return null;

  const direct = extractReceiptArray(value);
  if (direct?.length) return direct;

  if (typeof value === "object" && value !== null) {
    if ("result" in value) {
      const fromResult = extractReceiptsFromUnknown(value.result);
      if (fromResult?.length) return fromResult;
    }

    if ("structuredContent" in value) {
      const fromStructured = extractReceiptsFromUnknown(
        value.structuredContent,
      );
      if (fromStructured?.length) return fromStructured;
    }

    if (Array.isArray(value.contents)) {
      for (const item of value.contents) {
        const fromItem = extractReceiptsFromUnknown(item);
        if (fromItem?.length) return fromItem;
      }
    }

    if (Array.isArray(value.content)) {
      for (const item of value.content) {
        const fromItem = extractReceiptsFromUnknown(item);
        if (fromItem?.length) return fromItem;
      }
    }

    if (typeof value.text === "string") {
      const parsed = tryParseJson(value.text);
      const fromParsed = extractReceiptsFromUnknown(parsed);
      if (fromParsed?.length) return fromParsed;
    }

    if (typeof value.data === "string") {
      const parsed = tryParseJson(value.data);
      const fromParsed = extractReceiptsFromUnknown(parsed);
      if (fromParsed?.length) return fromParsed;
    }
  }

  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    const fromParsed = extractReceiptsFromUnknown(parsed);
    if (fromParsed?.length) return fromParsed;
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanReceipt(receipt: any): CleanReceipt {
  return {
    id: typeof receipt.id === "string" ? receipt.id : "",
    shortId: shortenId(receipt.id),
    merchantName:
      typeof receipt.merchantName === "string"
        ? receipt.merchantName
        : "Unknown",
    purchaseDate: normalizeDate(receipt.purchaseDate),
    totalAmount:
      typeof receipt.totalAmount === "number" ||
      typeof receipt.totalAmount === "string"
        ? receipt.totalAmount
        : "",
    currency: typeof receipt.currency === "string" ? receipt.currency : "",
    category: typeof receipt.category === "string" ? receipt.category : "",
    hasImage: Boolean(receipt.imageUrl),
    imageUrl: typeof receipt.imageUrl === "string" ? receipt.imageUrl : null,
  };
}

function dedupeReceipts(receipts: CleanReceipt[]): CleanReceipt[] {
  const seen = new Set<string>();

  return receipts.filter((receipt) => {
    const key =
      receipt.id ||
      `${receipt.merchantName}-${receipt.purchaseDate}-${receipt.totalAmount}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatReceiptsForModel(receipts: CleanReceipt[]): string {
  return JSON.stringify(
    {
      receiptCount: receipts.length,
      receipts: receipts.map((r, index) => ({
        number: index + 1,
        shortId: r.shortId,
        merchant: r.merchantName,
        date: r.purchaseDate,
        amount: r.totalAmount,
        currency: r.currency,
        category: r.category,
        hasImage: r.hasImage,
      })),
    },
    null,
    2,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyContentParts(content: any): string {
  if (!Array.isArray(content)) return JSON.stringify(content, null, 2);

  const textParts = content
    .map((item: unknown) => {
      if (typeof item === "string") return item;

      if (
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "text" in item &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).type === "text"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any).text as string;
      }

      return JSON.stringify(item);
    })
    .filter(Boolean);

  return textParts.length
    ? textParts.join("\n")
    : JSON.stringify(content, null, 2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextFromAnyResult(result: any): string {
  if (!result) return "No result.";

  const receipts = extractReceiptsFromUnknown(result);
  if (receipts?.length) {
    return formatReceiptsForModel(receipts.map(cleanReceipt));
  }

  const structured = tryExtractStructuredResult(result);

  if (typeof result === "string") return result;
  if (structured) return JSON.stringify(structured, null, 2);
  if (Array.isArray(result.content))
    return stringifyContentParts(result.content);

  return JSON.stringify(result, null, 2);
}

function isSyntheticToolName(name: string): name is SyntheticToolName {
  return (
    name === "mcp_list_resources" ||
    name === "mcp_read_resource" ||
    name === "mcp_read_resource_template" ||
    name === "mcp_list_prompts" ||
    name === "mcp_get_prompt"
  );
}

function buildUriFromTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value == null) {
      throw new Error(`Missing template value for "${key}"`);
    }
    return encodeURIComponent(value);
  });
}

async function executeSyntheticTool(
  mcpClient: Client,
  name: SyntheticToolName,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "mcp_list_resources": {
      const result = await mcpClient.listResources();
      return {
        structuredContent: {
          resources: result.resources ?? [],
        },
      };
    }

    case "mcp_read_resource": {
      const uri = typeof args.uri === "string" ? args.uri : "";
      if (!uri) {
        throw new Error("mcp_read_resource requires a uri");
      }

      const result = await mcpClient.readResource({ uri });
      return {
        structuredContent: result,
      };
    }

    case "mcp_read_resource_template": {
      const template = typeof args.template === "string" ? args.template : "";
      const rawValues =
        args.values &&
        typeof args.values === "object" &&
        !Array.isArray(args.values)
          ? (args.values as Record<string, unknown>)
          : null;

      if (!template) {
        throw new Error("mcp_read_resource_template requires a template");
      }

      if (!rawValues) {
        throw new Error("mcp_read_resource_template requires values");
      }

      const values: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawValues)) {
        if (value == null) continue;
        values[key] = String(value);
      }

      const uri = buildUriFromTemplate(template, values);
      const result = await mcpClient.readResource({ uri });

      return {
        structuredContent: {
          uri,
          result,
        },
      };
    }

    case "mcp_list_prompts": {
      const result = await mcpClient.listPrompts();
      return {
        structuredContent: {
          prompts: result.prompts ?? [],
        },
      };
    }

    case "mcp_get_prompt": {
      const promptName = typeof args.name === "string" ? args.name : "";
      const promptArgs = toPromptArguments(args.arguments);

      if (!promptName) {
        throw new Error("mcp_get_prompt requires a name");
      }

      const result = await mcpClient.getPrompt({
        name: promptName,
        arguments: promptArgs,
      });

      return {
        structuredContent: result,
      };
    }

    default:
      throw new Error(`Unknown synthetic tool: ${name}`);
  }
}

function buildForcedToolCall(
  name: string,
  args: Record<string, unknown>,
  id: string,
): ForcedToolCall {
  return {
    id,
    type: "function",
    function: {
      name,
      arguments: JSON.stringify(args),
    },
  };
}

function coerceCount(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

function buildForcedToolCallsFromActionPayload(
  actionPayload: ActionPayload | null | undefined,
): ForcedToolCall[] {
  if (!actionPayload) return [];

  switch (actionPayload.action) {
    case "create-receipt-from-image":
      return [
        buildForcedToolCall(
          "create_receipt_from_image",
          {
            request: {
              imageUrl: actionPayload.imageUrl,
            },
          },
          "action-create-receipt-from-image",
        ),
      ];

    case "receipts-by-category":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://category/{category}",
            values: {
              category: actionPayload.category,
            },
          },
          "action-receipts-by-category",
        ),
      ];

    case "receipts-by-id":
      return [
        buildForcedToolCall(
          "get_receipt_by_id",
          {
            id: actionPayload.receiptId,
          },
          "action-receipt-by-id",
        ),
      ];

    case "recent-count":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://recent/{count}",
            values: {
              count: String(coerceCount(actionPayload.count, 5)),
            },
          },
          "action-recent-count",
        ),
      ];

    case "top-10-resource":
      return [
        buildForcedToolCall(
          "mcp_read_resource",
          {
            uri: "receipt://recent",
          },
          "action-top-10-resource",
        ),
      ];

    case "receipts-by-date-range":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://date/{from}/{to}",
            values: {
              from: actionPayload.startDate,
              to: actionPayload.endDate,
            },
          },
          "action-receipts-by-date-range",
        ),
      ];

    default:
      return [];
  }
}

function buildForcedToolCallsFromSelectedContext(
  selectedContext: SelectedContext,
  tools: McpTool[],
  prompts: McpPrompt[],
): ForcedToolCall[] {
  if (!selectedContext) return [];

  if (selectedContext.type === "resource") {
    return [
      buildForcedToolCall(
        "mcp_read_resource",
        { uri: selectedContext.uri },
        "selected-resource-call",
      ),
    ];
  }

  if (selectedContext.type === "prompt") {
    const selectedPromptExists = prompts.some(
      (prompt: { name: string }) => prompt.name === selectedContext.name,
    );

    if (!selectedPromptExists) return [];

    return [
      buildForcedToolCall(
        "mcp_get_prompt",
        { name: selectedContext.name },
        "selected-prompt-call",
      ),
    ];
  }

  if (selectedContext.type === "tool") {
    const selectedToolExists = tools.some(
      (tool: { name: string }) => tool.name === selectedContext.name,
    );

    if (!selectedToolExists) return [];

    return [
      buildForcedToolCall(selectedContext.name, {}, "selected-tool-call"),
    ];
  }

  return [];
}

export async function POST(req: Request) {
  let mcpClient: Client | null = null;

  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const selectedContext: SelectedContext = body.selectedContext ?? null;
    const actionPayload: ActionPayload | null = body.actionPayload ?? null;

    if (!messages.length) {
      return Response.json({ error: "Missing messages" }, { status: 400 });
    }

    mcpClient = await createMcpClient();

    const listedTools = await mcpClient.listTools();
    const mcpTools = listedTools.tools ?? [];
    const listedPrompts = await mcpClient.listPrompts();
    const mcpPrompts = listedPrompts.prompts ?? [];

    const groqTools = toGroqTools(mcpTools);

    let toolCalls: ForcedToolCall[] = [];

    if (actionPayload) {
      toolCalls = buildForcedToolCallsFromActionPayload(actionPayload);
    } else if (selectedContext) {
      toolCalls = buildForcedToolCallsFromSelectedContext(
        selectedContext,
        mcpTools,
        mcpPrompts,
      );
    }

    let assistantMessage:
      | {
          content?: string | null;
          tool_calls?: ForcedToolCall[];
        }
      | undefined;

    if (!toolCalls.length) {
      const firstPass = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: [
              "You are a helpful receipt assistant.",
              "You can use MCP tools, MCP resources, and MCP prompts through the available functions.",
              "Use tools for mutations and exact receipt lookups.",
              "Use resources for summaries, recent receipts, category/date views, and similar prebuilt resource outputs.",
              "If the user selected a specific item in the UI, prioritize that item.",
              "Be concise, accurate, and practical.",
            ].join(" "),
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
        tools: groqTools,
        tool_choice: "auto",
        temperature: 0.2,
      });

      const modelMessage = firstPass.choices[0]?.message;

      if (!modelMessage) {
        return Response.json(
          { error: "No assistant message returned from Groq" },
          { status: 500 },
        );
      }

      assistantMessage = {
        content: modelMessage.content ?? "",
        tool_calls: (modelMessage.tool_calls ?? [])
          .filter(
            (
              call,
            ): call is {
              id: string;
              type: "function";
              function: {
                name: string;
                arguments: string;
              };
            } => call.type === "function" && "function" in call,
          )
          .map((call) => ({
            id: call.id,
            type: "function" as const,
            function: {
              name: call.function.name,
              arguments: call.function.arguments,
            },
          })),
      };

      toolCalls = assistantMessage.tool_calls ?? [];
    } else {
      assistantMessage = {
        content: actionPayload
          ? "Running the requested receipt action."
          : selectedContext?.type
            ? `Using the selected ${selectedContext.type}.`
            : "",
        tool_calls: toolCalls,
      };
    }

    if (!toolCalls.length) {
      return Response.json({
        outputText: assistantMessage?.content || "No response generated.",
        toolCalls: [],
        toolData: null,
      });
    }

    const toolResults: Array<{
      id: string;
      name: string;
      content: string;
    }> = [];

    let returnedReceipts: CleanReceipt[] = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const args = parseToolArguments(toolCall.function.arguments);

      try {
        const rawResult = isSyntheticToolName(toolName)
          ? await executeSyntheticTool(mcpClient, toolName, args)
          : await mcpClient.callTool({
              name: toolName,
              arguments: args,
            });

        const receipts = extractReceiptsFromUnknown(rawResult);

        if (receipts?.length) {
          returnedReceipts = [
            ...returnedReceipts,
            ...receipts.map(cleanReceipt),
          ];
        }

        toolResults.push({
          id: toolCall.id,
          name: toolName,
          content: extractTextFromAnyResult(rawResult),
        });
      } catch (error) {
        toolResults.push({
          id: toolCall.id,
          name: toolName,
          content:
            error instanceof Error
              ? `Tool execution failed: ${error.message}`
              : "Tool execution failed.",
        });
      }
    }

    const secondPass = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: [
            "You are a helpful receipt assistant.",
            "Use the tool, resource, and prompt outputs to answer clearly and naturally.",
            "Do not use markdown tables.",
            "Prefer short paragraphs or numbered lists.",
            "When listing receipts, use this format:",
            "1. Merchant — Date — Amount — Category — ID: shortId",
            "Use only the first 8 characters of a receipt ID unless the full ID is explicitly requested.",
            "Do not print raw image URLs unless the user explicitly asks for them.",
            "If an image exists, say 'image available'.",
            "Format dates as YYYY-MM-DD.",
            "Format currency naturally.",
            "Keep the answer compact and presentable.",
          ].join(" "),
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: "assistant" as const,
          content: assistantMessage?.content ?? "",
          tool_calls: toolCalls.map((call) => ({
            id: call.id,
            type: "function" as const,
            function: {
              name: call.function.name,
              arguments: call.function.arguments,
            },
          })),
        },
        ...toolResults.map((result) => ({
          role: "tool" as const,
          tool_call_id: result.id,
          content: result.content,
        })),
      ],
      tools: groqTools,
      tool_choice: "none",
      temperature: 0.2,
    });

    const finalMessage = secondPass.choices[0]?.message?.content;
    const finalReceipts = dedupeReceipts(returnedReceipts);

    return Response.json({
      outputText: finalMessage || "No final response generated.",
      toolCalls: toolResults.map((r) => ({
        id: r.id,
        name: r.name,
      })),
      toolData: finalReceipts.length
        ? {
            receipts: finalReceipts,
          }
        : null,
    });
  } catch (error) {
    console.error("[CHAT_ROUTE_ERROR]", error);

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    try {
      await mcpClient?.close();
    } catch {
      // ignore close errors
    }
  }
}
