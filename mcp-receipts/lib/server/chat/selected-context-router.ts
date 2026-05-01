import {
  ForcedToolCall,
  McpPrompt,
  McpTool,
  SelectedContext,
} from "./chat-types";

function buildForcedToolCall(
  name: string,
  args: Record<string, unknown>,
  id: string,
): ForcedToolCall {
  return {
    id,
    type: "function",
    function: {
      name,
      arguments: JSON.stringify(args),
    },
  };
}

export function buildForcedToolCallsFromSelectedContext(
  selectedContext: SelectedContext,
  tools: McpTool[],
  prompts: McpPrompt[],
): ForcedToolCall[] {
  if (!selectedContext) return [];

  if (selectedContext.type === "resource") {
    if (selectedContext.uri.includes("{")) {
      return [
        buildForcedToolCall(
          "mcp_get_prompt",
          { name: "receipts_paged_resource" },
          "selected-resource-template-needs-input",
        ),
      ];
    }

    return [
      buildForcedToolCall(
        "mcp_read_resource",
        { uri: selectedContext.uri },
        "selected-resource-call",
      ),
    ];
  }

  if (selectedContext.type === "prompt") {
    const exists = prompts.some(
      (prompt: { name: string }) => prompt.name === selectedContext.name,
    );

    if (!exists) return [];

    if (selectedContext.name === "receipts_this_month") {
      return [
        buildForcedToolCall(
          "mcp_read_resource",
          { uri: "receipt://this-month" },
          "selected-prompt-receipts-this-month",
        ),
      ];
    }

    return [
      buildForcedToolCall(
        "mcp_get_prompt",
        { name: selectedContext.name },
        "selected-prompt-call",
      ),
    ];
  }

  if (selectedContext.type === "tool") {
    const exists = tools.some(
      (tool: { name: string }) => tool.name === selectedContext.name,
    );

    if (!exists) return [];

    return [
      buildForcedToolCall(selectedContext.name, {}, "selected-tool-call"),
    ];
  }

  return [];
}
