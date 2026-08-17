import { isRecord, jsonError, safeMcpError } from "@/lib/server/mcp/http";
import { readMcpResource } from "@/lib/server/mcp/operations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.uri !== "string" || !body.uri.trim()) {
      return jsonError("A resolved resource URI is required.", 400);
    }
    if (body.uri.includes("{") || body.uri.includes("}")) {
      return jsonError("Resource URI contains unresolved template variables.", 400);
    }

    const result = await readMcpResource(body.uri);
    return Response.json({ kind: "resource", uri: body.uri, result });
  } catch (error) {
    return safeMcpError(error, "Resource read");
  }
}
