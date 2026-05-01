import { Client } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

export async function createMcpClient() {
  const serverUrl = process.env.MCP_SERVER_URL;

  if (!serverUrl) {
    throw new Error("Missing MCP_SERVER_URL");
  }

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl));

  const client = new Client({
    name: "receipt-assistant-chat",
    version: "1.0.0",
  });

  await client.connect(transport);
  return client;
}
