import { describe, expect, it } from "vitest";
import {
  buildPromptArguments,
  buildToolArguments,
  getResourceTemplateVariables,
  isMutationTool,
  resolveResourceTemplate,
} from "./capability-utils";
import type { McpPrompt, McpResourceTemplate, McpTool } from "../types";

const pagedTool: McpTool = {
  kind: "tool",
  name: "get_receipts_paged",
  inputSchema: {
    type: "object",
    properties: {
      request: {
        type: "object",
        properties: {
          pageNumber: { type: "integer" },
          pageSize: { type: "integer" },
        },
      },
    },
    required: ["request"],
  },
  annotations: { readOnlyHint: true },
};

describe("MCP capability validation", () => {
  it("keeps a no-argument tool as an empty argument object", () => {
    const tool: McpTool = { kind: "tool", name: "all", inputSchema: { type: "object", properties: {} } };
    expect(buildToolArguments(tool, {})).toEqual({ ok: true, value: {} });
  });

  it("builds the nested request object advertised by a tool", () => {
    expect(
      buildToolArguments(pagedTool, {
        "request.pageNumber": "1",
        "request.pageSize": "10",
      }),
    ).toEqual({
      ok: true,
      value: { request: { pageNumber: 1, pageSize: 10 } },
    });
  });

  it("rejects missing nested required values", () => {
    const result = buildToolArguments(pagedTool, {});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["request.pageNumber"]).toMatch(/required/i);
  });

  it("validates UUID fields", () => {
    const tool: McpTool = {
      kind: "tool",
      name: "get_receipt_by_id",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
      },
    };
    const result = buildToolArguments(tool, { id: "not-a-uuid" });
    expect(result.ok).toBe(false);
  });

  it("extracts, validates and safely encodes template variables", () => {
    const template: McpResourceTemplate = {
      kind: "resourceTemplate",
      name: "category",
      uriTemplate: "receipt://category/{category}",
      variables: ["category"],
    };
    expect(getResourceTemplateVariables(template.uriTemplate)).toEqual(["category"]);
    expect(resolveResourceTemplate(template, { category: "Food & drink" })).toEqual({
      ok: true,
      value: "receipt://category/Food%20%26%20drink",
    });
    expect(resolveResourceTemplate(template, {})).toMatchObject({ ok: false });
  });

  it("validates no-, single-, and multi-argument prompts", () => {
    const prompt = (names: string[]): McpPrompt => ({
      kind: "prompt",
      name: "prompt",
      arguments: names.map((name) => ({ name, required: true })),
    });
    expect(buildPromptArguments(prompt([]), {})).toEqual({ ok: true, value: {} });
    expect(buildPromptArguments(prompt(["date"]), { date: "2026-08-12" })).toEqual({
      ok: true,
      value: { date: "2026-08-12" },
    });
    expect(buildPromptArguments(prompt(["from", "to"]), { from: "2026-08-01" })).toMatchObject({ ok: false });
  });

  it("requires confirmation for tools not advertised as read-only", () => {
    expect(isMutationTool(pagedTool)).toBe(false);
    expect(isMutationTool({ ...pagedTool, annotations: {} })).toBe(true);
  });
});
