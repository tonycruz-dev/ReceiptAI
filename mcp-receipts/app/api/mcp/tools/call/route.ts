import { callMcpTool } from "@/lib/server/mcp/operations";
import { isRecord, jsonError, safeMcpError } from "@/lib/server/mcp/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.name !== "string" || !body.name.trim()) {
      return jsonError("Tool name is required.", 400);
    }
    if (!isRecord(body.arguments)) {
      return jsonError("Tool arguments must be an object.", 400);
    }

    const result = await callMcpTool(
      body.name,
      body.arguments,
      body.confirmed === true,
    );
    if (result.isError) {
      return Response.json(
        { error: "Tool execution failed.", result },
        { status: 422 },
      );
    }
    return Response.json({ kind: "tool", name: body.name, result });
  } catch (error) {
    return safeMcpError(error, "Tool execution");
  }
}
