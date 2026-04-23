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

// // This file defines a Next.js API route that connects to an MCP server using the MCP client SDK,
// // fetches the full catalog of tools, resources, prompts, and resource templates, and returns them as JSON.
// // It includes error handling and logs key steps for debugging.
// // app/api/mcp/catalog/route.ts
// import { NextResponse } from "next/server";

// // Pseudocode imports: check the exact transport class names in the SDK version you install.
// import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

// type PaginatedResult<T> = {
//   items: T[];
//   nextCursor?: string;
// };

// // Helper function to collect all items across paginated results.
// // This function repeatedly calls the provided fetchPage function with the next cursor until there are no more pages,
// async function collectAll<T>(
//   fetchPage: (cursor?: string) => Promise<PaginatedResult<T>>,
// ): Promise<T[]> {
//   const all: T[] = [];
//   let cursor: string | undefined = undefined;

//   while (true) {
//     const page = await fetchPage(cursor);
//     all.push(...page.items);

//     if (!page.nextCursor) break;
//     cursor = page.nextCursor;
//   }

//   return all;
// }

// // The GET function is the handler for GET requests to this API route.
// // It connects to the MCP server, fetches the catalog data, and returns it as JSON.
// export async function GET() {
//   const serverUrl = process.env.MCP_SERVER_URL;
//   console.log("[MCP Catalog] MCP_SERVER_URL:", serverUrl);
//   if (!serverUrl) {
//     return NextResponse.json(
//       { error: "Missing MCP_SERVER_URL" },
//       { status: 500 },
//     );
//   }

//   // Replace with the correct transport for your SDK version / server transport.
//   const transport = new StreamableHTTPClientTransport(new URL(serverUrl));

//   // Create the MCP client and connect to the server.
//   // The client will be used to make requests to the MCP server for tools, resources, prompts, and resource templates.
//   const client = new Client({
//     name: "nextjs-catalog-client",
//     version: "1.0.0",
//   });

//   try {
//      await client.connect(transport);

//     // These calls are representative of the MCP protocol operations:
//     // tools/list, resources/list, prompts/list, resources/templates/list
//     console.log("[MCP Catalog] Fetching tools, resources, prompts, and resource templates from MCP server...");
//     const tools = await collectAll(async (cursor) => {
//       const result = await client.listTools({ cursor });
//       return { items: result.tools, nextCursor: result.nextCursor };
//     });

//     // For resources, prompts, and resource templates, we check if the corresponding client methods exist before calling them,
//     // since they may be optional depending on the MCP server implementation.
//     const resources = await collectAll(async (cursor) => {
//        const result = await client.listResources({ cursor });
//       return { items: result.resources, nextCursor: result.nextCursor };
//     });

//     // If the server doesn't implement these methods, we return empty arrays for those catalog sections.
//     const prompts = await collectAll(async (cursor) => {
//        const result = await client.listPrompts({ cursor });
//       return { items: result.prompts, nextCursor: result.nextCursor };
//     });

//     // Resource templates may also be optional, so we check for the method and return an empty array if it's not implemented.
//     const resourceTemplates = await collectAll(async (cursor) => {
//       const result = await client.listResourceTemplates?.({ cursor });
//       return {
//         items: result.resourceTemplates,
//         nextCursor: result.nextCursor,
//       };
//     });

//     return NextResponse.json({
//       tools,
//       resources,
//       prompts,
//       resourceTemplates,
//     });
//   } catch (error) {
//     console.error("Failed to query MCP catalog:", error);
//     return NextResponse.json(
//       { error: "Failed to query MCP backend" },
//       { status: 500 },
//     );
//   } finally {
//      await client.close();
//   }
// }
