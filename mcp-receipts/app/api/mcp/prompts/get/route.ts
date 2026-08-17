import { isRecord, jsonError, safeMcpError } from "@/lib/server/mcp/http";
import { getMcpPrompt } from "@/lib/server/mcp/operations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.name !== "string" || !body.name.trim()) {
      return jsonError("Prompt name is required.", 400);
    }

    let promptArguments: Record<string, string> | undefined;
    if (body.arguments !== undefined) {
      if (!isRecord(body.arguments)) {
        return jsonError("Prompt arguments must be an object.", 400);
      }
      promptArguments = {};
      for (const [name, value] of Object.entries(body.arguments)) {
        if (typeof value !== "string") {
          return jsonError(`Prompt argument "${name}" must be a string.`, 400);
        }
        promptArguments[name] = value;
      }
    }

    const result = await getMcpPrompt(body.name, promptArguments);
    return Response.json({
      kind: "prompt",
      name: body.name,
      description: result.description,
      messages: result.messages,
    });
  } catch (error) {
    return safeMcpError(error, "Prompt retrieval");
  }
}
