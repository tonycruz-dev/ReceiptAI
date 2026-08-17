import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  listTools: vi.fn(),
  callTool: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../chat/mcp-client", () => ({
  createMcpClient: vi.fn().mockResolvedValue(client),
}));

import { callMcpTool } from "./operations";

describe("central MCP tool operation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.close.mockResolvedValue(undefined);
  });

  it("calls a read-only tool with its exact name and arguments", async () => {
    client.listTools.mockResolvedValue({
      tools: [{ name: "get_all_receipts", annotations: { readOnlyHint: true } }],
    });
    client.callTool.mockResolvedValue({ content: [], isError: false });

    await callMcpTool("get_all_receipts", {});

    expect(client.callTool).toHaveBeenCalledWith(
      { name: "get_all_receipts", arguments: {} },
      expect.objectContaining({ timeout: 30_000 }),
    );
  });

  it("does not invoke a mutation without explicit confirmation", async () => {
    client.listTools.mockResolvedValue({
      tools: [{ name: "delete_receipt", annotations: { readOnlyHint: false } }],
    });

    await expect(
      callMcpTool("delete_receipt", {
        id: "00000000-0000-4000-8000-000000000000",
      }),
    ).rejects.toThrow(/confirmation/i);
    expect(client.callTool).not.toHaveBeenCalled();
  });
});
