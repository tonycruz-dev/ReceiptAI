"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { useEffect, useRef } from "react";

export function McpServerManager() {
  const { setMcpServers } = useCopilotChat() as {
    setMcpServers?: (
      servers: Array<{ endpoint: string; apiKey?: string }>,
    ) => void;
  };

  const didWarnRef = useRef(false);

  useEffect(() => {
    if (typeof setMcpServers !== "function") {
      if (!didWarnRef.current) {
        didWarnRef.current = true;
        console.warn(
          "[McpServerManager] CopilotKit does not expose setMcpServers in this build. Skipping MCP server registration. Configure MCP servers in your Copilot Runtime instead.",
        );
      }
      return;
    }

    // If this hook exists (it may not, depending on CopilotKit build), point it
    // at the local .NET MCP server.
    console.log("[McpServerManager] Registering MCP server at http://localhost:5144/mcp");
    setMcpServers([{ endpoint: "http://localhost:5241/mcp" }]);
  }, [setMcpServers]);

  return null;
}
