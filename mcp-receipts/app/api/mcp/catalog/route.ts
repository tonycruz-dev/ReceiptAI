import { NextResponse } from "next/server";
import { Client, StreamableHTTPClientTransport,} from "@modelcontextprotocol/client";

type PaginatedResult<T> = {
  items: T[];
  nextCursor?: string;
};
type UnifiedResource = {
  type: "resource" | "template";
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
};

async function collectAll<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const page = await fetchPage(cursor);
    all.push(...page.items);

    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }

  return all;
}

function normalizeMcpEndpoint(baseUrl: string) {
  return baseUrl.endsWith("/mcp")
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, "")}/mcp`;
}

export async function GET() {
  const rawServerUrl = process.env.MCP_SERVER_URL;

  if (!rawServerUrl) {
    return NextResponse.json(
      { error: "Missing MCP_SERVER_URL" },
      { status: 500 },
    );
  }

  const serverUrl = normalizeMcpEndpoint(rawServerUrl);
  console.log("[MCP Catalog] Using MCP endpoint:", serverUrl);

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl));

  const client = new Client({
    name: "nextjs-catalog-client",
    version: "1.0.0",
  });

  try {
    await client.connect(transport);

    const tools = await collectAll(async (cursor) => {
      const result = await client.listTools({ cursor });
      return {
        items: result.tools ?? [],
        nextCursor: result.nextCursor,
      };
    });

    const resources = await collectAll(async (cursor) => {
      const result = await client.listResources({ cursor });
      return {
        items: result.resources ?? [],
        nextCursor: result.nextCursor,
      };
    });

    const prompts = await collectAll(async (cursor) => {
      const result = await client.listPrompts({ cursor });
      return {
        items: result.prompts ?? [],
        nextCursor: result.nextCursor,
      };
    });

    const resourceTemplates =
      typeof client.listResourceTemplates === "function"
        ? await collectAll(async (cursor) => {
            const result = await client.listResourceTemplates({ cursor });
            return {
              items: result.resourceTemplates ?? [],
              nextCursor: result.nextCursor,
            };
          })
        : [];

    const unifiedResources: UnifiedResource[] = [
      ...resources.map((r) => ({
        type: "resource" as const,
        name: r.name ?? r.uri,
        uri: r.uri,
        description: r.description,
        mimeType: r.mimeType,
      })),

      ...resourceTemplates.map((t) => ({
        type: "template" as const,
        name: t.name ?? t.uriTemplate,
        uri: t.uriTemplate, // important
        description: t.description,
        mimeType: t.mimeType,
      })),
    ];    

    return NextResponse.json({
      endpoint: serverUrl,
      tools,
      resources: unifiedResources, // 👈 replace
      prompts,
      resourceTemplates,
    });
  } catch (error) {
    console.error("[MCP Catalog] Failed to query MCP catalog:", error);

    return NextResponse.json(
      {
        error: "Failed to query MCP backend",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
