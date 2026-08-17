import type {
  CallToolResult,
  GetPromptResult,
  PromptMessage,
  ReadResourceResult,
} from "@modelcontextprotocol/client";
import { createMcpClient } from "../chat/mcp-client";

const requestTimeout = 30_000;

export async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  confirmed = false,
): Promise<CallToolResult> {
  return withMcpClient(async (client) => {
    const listed = await client.listTools();
    const tool = listed.tools.find((candidate) => candidate.name === name);
    if (!tool) throw new McpInputError(`Unknown MCP tool: ${name}`);
    if (tool.annotations?.readOnlyHint !== true && !confirmed) {
      throw new McpInputError("Mutation tools require explicit confirmation.");
    }
    return client.callTool(
      { name, arguments: args },
      { timeout: requestTimeout, resetTimeoutOnProgress: true },
    );
  });
}

export class McpInputError extends Error {}

export async function readMcpResource(
  uri: string,
): Promise<ReadResourceResult> {
  return withMcpClient((client) =>
    client.readResource(
      { uri },
      { timeout: requestTimeout, resetTimeoutOnProgress: true },
    ),
  );
}

export async function getMcpPrompt(
  name: string,
  args?: Record<string, string>,
): Promise<GetPromptResult> {
  return withMcpClient((client) =>
    client.getPrompt(
      { name, arguments: args },
      { timeout: requestTimeout, resetTimeoutOnProgress: true },
    ),
  );
}

export function promptMessageText(message: PromptMessage): string {
  switch (message.content.type) {
    case "text":
      return message.content.text;
    case "resource":
      return "text" in message.content.resource
        ? message.content.resource.text
        : `[Embedded resource: ${message.content.resource.uri}]`;
    case "resource_link":
      return `[Resource: ${message.content.name} — ${message.content.uri}]`;
    case "image":
      return `[Image content: ${message.content.mimeType}]`;
    case "audio":
      return `[Audio content: ${message.content.mimeType}]`;
    default:
      return "[Unsupported MCP prompt content]";
  }
}

async function withMcpClient<T>(
  operation: (client: Awaited<ReturnType<typeof createMcpClient>>) => Promise<T>,
): Promise<T> {
  const client = await createMcpClient();
  try {
    return await operation(client);
  } finally {
    await client.close().catch(() => undefined);
  }
}
