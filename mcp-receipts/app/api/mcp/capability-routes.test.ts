import { beforeEach, describe, expect, it, vi } from "vitest";

const operations = vi.hoisted(() => ({
  callMcpTool: vi.fn(),
  readMcpResource: vi.fn(),
  getMcpPrompt: vi.fn(),
}));

vi.mock("@/lib/server/mcp/operations", () => operations);

import { POST as callTool } from "./tools/call/route";
import { POST as readResource } from "./resources/read/route";
import { POST as getPrompt } from "./prompts/get/route";

function post(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("capability-specific MCP routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the exact selected tool with its nested request", async () => {
    operations.callMcpTool.mockResolvedValue({ content: [], isError: false });
    const response = await callTool(
      post({
        name: "get_receipts_paged",
        arguments: { request: { pageNumber: 1, pageSize: 10 } },
      }),
    );
    expect(response.status).toBe(200);
    expect(operations.callMcpTool).toHaveBeenCalledWith(
      "get_receipts_paged",
      { request: { pageNumber: 1, pageSize: 10 } },
      false,
    );
    expect(operations.readMcpResource).not.toHaveBeenCalled();
  });

  it("rejects malformed tool requests before MCP invocation", async () => {
    const response = await callTool(post({ name: "get_receipt_by_id" }));
    expect(response.status).toBe(400);
    expect(operations.callMcpTool).not.toHaveBeenCalled();
  });

  it("reads the exact resolved resource URI and never calls a tool", async () => {
    operations.readMcpResource.mockResolvedValue({ contents: [] });
    const uri = "receipt://category/Food%20%26%20drink";
    const response = await readResource(post({ uri }));
    expect(response.status).toBe(200);
    expect(operations.readMcpResource).toHaveBeenCalledWith(uri);
    expect(operations.callMcpTool).not.toHaveBeenCalled();
  });

  it("rejects unresolved resource templates", async () => {
    const response = await readResource(
      post({ uri: "receipt://category/{category}" }),
    );
    expect(response.status).toBe(400);
    expect(operations.readMcpResource).not.toHaveBeenCalled();
  });

  it("gets the exact prompt with all supplied arguments", async () => {
    operations.getMcpPrompt.mockResolvedValue({
      messages: [{ role: "user", content: { type: "text", text: "Prompt" } }],
    });
    const response = await getPrompt(
      post({
        name: "receipts_by_date_range",
        arguments: { startDate: "2026-08-01", endDate: "2026-08-31" },
      }),
    );
    expect(response.status).toBe(200);
    expect(operations.getMcpPrompt).toHaveBeenCalledWith(
      "receipts_by_date_range",
      { startDate: "2026-08-01", endDate: "2026-08-31" },
    );
    expect(operations.readMcpResource).not.toHaveBeenCalled();
    expect(operations.callMcpTool).not.toHaveBeenCalled();
  });
});
