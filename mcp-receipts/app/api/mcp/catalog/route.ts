import type {
  Prompt,
  Resource,
  Tool,
} from "@modelcontextprotocol/client";
import { createMcpClient } from "@/lib/server/chat/mcp-client";
import { getResourceTemplateVariables } from "@/lib/mcp/capability-utils";
import type {
  CatalogResponse,
  JsonSchema,
  McpPrompt,
  McpResourceTemplate,
  McpStaticResource,
  McpTool,
} from "@/lib/types";
import { safeMcpError } from "@/lib/server/mcp/http";

export const runtime = "nodejs";

type Page<T> = { items: T[]; nextCursor?: string };
type DiscoveredResourceTemplate = {
  name: string;
  title?: string;
  uriTemplate: string;
  description?: string;
  mimeType?: string;
};

async function collectAll<T>(
  fetchPage: (cursor?: string) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return items;
}

export async function GET() {
  let client: Awaited<ReturnType<typeof createMcpClient>> | null = null;
  try {
    client = await createMcpClient();
    const [tools, resources, resourceTemplates, prompts] = await Promise.all([
      collectAll<Tool>(async (cursor) => {
        const result = await client!.listTools({ cursor });
        return { items: result.tools, nextCursor: result.nextCursor };
      }),
      collectAll<Resource>(async (cursor) => {
        const result = await client!.listResources({ cursor });
        return { items: result.resources, nextCursor: result.nextCursor };
      }),
      collectAll<DiscoveredResourceTemplate>(async (cursor) => {
        const result = await client!.listResourceTemplates({ cursor });
        return {
          items: result.resourceTemplates,
          nextCursor: result.nextCursor,
        };
      }),
      collectAll<Prompt>(async (cursor) => {
        const result = await client!.listPrompts({ cursor });
        return { items: result.prompts, nextCursor: result.nextCursor };
      }),
    ]);

    const response: CatalogResponse = {
      tools: tools.map(mapTool),
      resources: resources.map(mapResource),
      resourceTemplates: resourceTemplates.map(mapTemplate),
      prompts: prompts.map(mapPrompt),
    };
    return Response.json(response);
  } catch (error) {
    return safeMcpError(error, "MCP catalog discovery");
  } finally {
    await client?.close().catch(() => undefined);
  }
}

export function mapTool(tool: Tool): McpTool {
  return {
    kind: "tool",
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema as JsonSchema,
    outputSchema: tool.outputSchema as JsonSchema | undefined,
    annotations: tool.annotations,
  };
}

export function mapResource(resource: Resource): McpStaticResource {
  return {
    kind: "resource",
    name: resource.name,
    title: resource.title,
    uri: resource.uri,
    description: resource.description,
    mimeType: resource.mimeType,
  };
}

export function mapTemplate(template: DiscoveredResourceTemplate): McpResourceTemplate {
  return {
    kind: "resourceTemplate",
    name: template.name,
    title: template.title,
    uriTemplate: template.uriTemplate,
    description: template.description,
    mimeType: template.mimeType,
    variables: getResourceTemplateVariables(template.uriTemplate),
  };
}

export function mapPrompt(prompt: Prompt): McpPrompt {
  return {
    kind: "prompt",
    name: prompt.name,
    title: prompt.title,
    description: prompt.description,
    arguments: (prompt.arguments ?? []).map((argument) => ({
      name: argument.name,
      description: argument.description,
      required: argument.required === true,
    })),
  };
}
