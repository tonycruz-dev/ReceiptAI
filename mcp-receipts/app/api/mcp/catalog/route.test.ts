import { describe, expect, it } from "vitest";
import type { Prompt, Resource, Tool } from "@modelcontextprotocol/client";
import { mapPrompt, mapResource, mapTemplate, mapTool } from "./route";

describe("MCP catalog mapping", () => {
  it("preserves tools and their nested input schemas", () => {
    const mapped = mapTool({
      name: "paged",
      inputSchema: {
        type: "object",
        properties: { request: { type: "object" } },
        required: ["request"],
      },
    } as Tool);
    expect(mapped.kind).toBe("tool");
    expect(mapped.inputSchema.required).toEqual(["request"]);
  });

  it("keeps static resources and resource templates distinct", () => {
    expect(
      mapResource({ name: "Summary", uri: "receipt://summary" } as Resource),
    ).toMatchObject({ kind: "resource", uri: "receipt://summary" });
    expect(
      mapTemplate({
        name: "By category",
        uriTemplate: "receipt://category/{category}",
      }),
    ).toMatchObject({
      kind: "resourceTemplate",
      uriTemplate: "receipt://category/{category}",
      variables: ["category"],
    });
  });

  it("preserves prompt argument requirements", () => {
    expect(
      mapPrompt({
        name: "by-date",
        arguments: [{ name: "date", required: true }],
      } as Prompt),
    ).toMatchObject({
      kind: "prompt",
      arguments: [{ name: "date", required: true }],
    });
  });
});
