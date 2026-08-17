import type {
  PromptGetRequest,
  PromptGetResponse,
  ResourceReadRequest,
  ToolCallRequest,
} from "../types";

export async function callTool(request: ToolCallRequest) {
  return postJson("/api/mcp/tools/call", request);
}

export async function readResource(request: ResourceReadRequest) {
  return postJson("/api/mcp/resources/read", request);
}

export async function getPrompt(
  request: PromptGetRequest,
): Promise<PromptGetResponse> {
  return postJson("/api/mcp/prompts/get", request) as Promise<PromptGetResponse>;
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "MCP request failed.";
    throw new Error(message);
  }
  return data;
}
