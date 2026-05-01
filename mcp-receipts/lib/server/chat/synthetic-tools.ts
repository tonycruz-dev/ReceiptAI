import { Client } from "@modelcontextprotocol/client";
import { SyntheticToolName } from "./chat-types";

export function isSyntheticToolName(name: string): name is SyntheticToolName {
  return (
    name === "mcp_list_resources" ||
    name === "mcp_read_resource" ||
    name === "mcp_read_resource_template" ||
    name === "mcp_list_prompts" ||
    name === "mcp_get_prompt"
  );
}

export function toPromptArguments(
  value: unknown,
): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const result: Record<string, string> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (raw == null) continue;

    if (typeof raw === "string") {
      result[key] = raw;
    } else if (
      typeof raw === "number" ||
      typeof raw === "boolean" ||
      raw instanceof Date
    ) {
      result[key] = String(raw);
    } else {
      result[key] = JSON.stringify(raw);
    }
  }

  return Object.keys(result).length ? result : undefined;
}

export function buildUriFromTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = values[key];

    if (value == null) {
      throw new Error(`Missing template value for "${key}"`);
    }

    return encodeURIComponent(value);
  });
}

export async function executeSyntheticTool(
  mcpClient: Client,
  name: SyntheticToolName,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "mcp_list_resources": {
      const result = await mcpClient.listResources();

      return {
        structuredContent: {
          resources: result.resources ?? [],
        },
      };
    }

    case "mcp_read_resource": {
      const uri = typeof args.uri === "string" ? args.uri : "";

      if (!uri) {
        throw new Error("mcp_read_resource requires a uri");
      }

      const result = await mcpClient.readResource({ uri });

      return {
        structuredContent: result,
      };
    }

    case "mcp_read_resource_template": {
      const template = typeof args.template === "string" ? args.template : "";

      const rawValues =
        args.values &&
        typeof args.values === "object" &&
        !Array.isArray(args.values)
          ? (args.values as Record<string, unknown>)
          : null;

      if (!template) {
        throw new Error("mcp_read_resource_template requires a template");
      }

      if (!rawValues) {
        throw new Error("mcp_read_resource_template requires values");
      }

      const values: Record<string, string> = {};

      for (const [key, value] of Object.entries(rawValues)) {
        if (value == null) continue;
        values[key] = String(value);
      }

      const uri = buildUriFromTemplate(template, values);
      const result = await mcpClient.readResource({ uri });

      return {
        structuredContent: {
          uri,
          result,
        },
      };
    }

    case "mcp_list_prompts": {
      const result = await mcpClient.listPrompts();

      return {
        structuredContent: {
          prompts: result.prompts ?? [],
        },
      };
    }

    case "mcp_get_prompt": {
      const promptName = typeof args.name === "string" ? args.name : "";
      const promptArgs = toPromptArguments(args.arguments);

      if (!promptName) {
        throw new Error("mcp_get_prompt requires a name");
      }

      const result = await mcpClient.getPrompt({
        name: promptName,
        arguments: promptArgs,
      });

      return {
        structuredContent: result,
      };
    }

    default:
      throw new Error(`Unknown synthetic tool: ${name}`);
  }
}
