export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function safeMcpError(error: unknown, operation: string) {
  if (error instanceof Error && error.constructor.name === "McpInputError") {
    return jsonError(error.message, 400);
  }
  const message = error instanceof Error ? error.message : String(error);
  const isTimeout = /timeout|timed out/i.test(message);
  const isConnection = /connect|network|fetch failed|ECONN/i.test(message);

  if (isTimeout) return jsonError(`${operation} timed out.`, 504);
  if (isConnection) return jsonError("Could not connect to the MCP server.", 502);
  return jsonError(`${operation} failed: ${message}`, 502);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
