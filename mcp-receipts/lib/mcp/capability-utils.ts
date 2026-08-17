import type {
  JsonSchema,
  McpPrompt,
  McpResourceTemplate,
  McpTool,
} from "../types/index.ts";

export type CapabilityField = {
  path: string;
  label: string;
  description?: string;
  required: boolean;
  schema: JsonSchema;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getResourceTemplateVariables(uriTemplate: string): string[] {
  const variables = new Set<string>();
  for (const match of uriTemplate.matchAll(/\{([^{}]+)\}/g)) {
    variables.add(match[1]);
  }
  return [...variables];
}

export function resolveResourceTemplate(
  template: McpResourceTemplate | string,
  values: Record<string, string>,
): ValidationResult<string> {
  const uriTemplate =
    typeof template === "string" ? template : template.uriTemplate;
  const variables = getResourceTemplateVariables(uriTemplate);
  const errors: Record<string, string> = {};

  for (const variable of variables) {
    if (!values[variable]?.trim()) {
      errors[variable] = `${friendlyLabel(variable)} is required.`;
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: uriTemplate.replace(/\{([^{}]+)\}/g, (_, variable: string) =>
      encodeURIComponent(values[variable].trim()),
    ),
  };
}

export function getToolFields(tool: McpTool): CapabilityField[] {
  return schemaFields(tool.inputSchema);
}

export function getPromptFields(prompt: McpPrompt): CapabilityField[] {
  return prompt.arguments.map((argument) => ({
    path: argument.name,
    label: friendlyLabel(argument.name),
    description: argument.description,
    required: argument.required,
    schema: { type: "string" },
  }));
}

export function getTemplateFields(
  template: McpResourceTemplate,
): CapabilityField[] {
  return template.variables.map((variable) => ({
    path: variable,
    label: friendlyLabel(variable),
    required: true,
    schema: inferTemplateSchema(variable),
  }));
}

export function buildToolArguments(
  tool: McpTool,
  values: Record<string, string>,
): ValidationResult<Record<string, unknown>> {
  const errors: Record<string, string> = {};
  const value = buildObject(tool.inputSchema, values, "", errors);
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

export function buildPromptArguments(
  prompt: McpPrompt,
  values: Record<string, string>,
): ValidationResult<Record<string, string>> {
  const errors: Record<string, string> = {};
  const result: Record<string, string> = {};

  for (const argument of prompt.arguments) {
    const value = values[argument.name]?.trim() ?? "";
    if (argument.required && !value) {
      errors[argument.name] = `${friendlyLabel(argument.name)} is required.`;
    } else if (value) {
      result[argument.name] = value;
    }
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: result };
}

export function isMutationTool(tool: McpTool): boolean {
  return tool.annotations?.readOnlyHint !== true;
}

export function friendlyLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function schemaFields(
  schema: JsonSchema,
  prefix = "",
  parentRequired = new Set(schema.required ?? []),
): CapabilityField[] {
  const fields: CapabilityField[] = [];

  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    const path = prefix ? `${prefix}.${name}` : name;
    const required = parentRequired.has(name);
    const isStructuredObject =
      schemaType(property) === "object" &&
      Object.keys(property.properties ?? {}).length > 0;

    if (isStructuredObject) {
      fields.push(
        ...schemaFields(
          property,
          path,
          new Set(property.required ?? Object.keys(property.properties ?? {})),
        ).map((field) => ({ ...field, required: required || field.required })),
      );
    } else {
      fields.push({
        path,
        label: property.title ?? friendlyLabel(name),
        description: property.description,
        required,
        schema: property,
      });
    }
  }

  return fields;
}

function buildObject(
  schema: JsonSchema,
  values: Record<string, string>,
  prefix: string,
  errors: Record<string, string>,
  requireAllChildren = false,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const required = new Set(
    schema.required ?? (requireAllChildren ? Object.keys(schema.properties ?? {}) : []),
  );

  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    const path = prefix ? `${prefix}.${name}` : name;
    const isRequired = required.has(name);
    const type = schemaType(property);

    if (type === "object" && Object.keys(property.properties ?? {}).length) {
      const nested = buildObject(property, values, path, errors, isRequired);
      if (Object.keys(nested).length || isRequired) result[name] = nested;
      continue;
    }

    const raw = values[path]?.trim() ?? "";
    if (!raw) {
      if (isRequired) errors[path] = `${friendlyLabel(name)} is required.`;
      continue;
    }

    const parsed = parseValue(raw, property, path, errors);
    if (parsed !== undefined) result[name] = parsed;
  }

  return result;
}

function parseValue(
  raw: string,
  schema: JsonSchema,
  path: string,
  errors: Record<string, string>,
): unknown {
  const type = schemaType(schema);

  if (schema.format === "uuid" && !uuidPattern.test(raw)) {
    errors[path] = "Enter a valid UUID.";
    return undefined;
  }

  if (schema.format === "date" && Number.isNaN(Date.parse(`${raw}T00:00:00Z`))) {
    errors[path] = "Enter a valid date.";
    return undefined;
  }

  if (schema.format === "date-time" && Number.isNaN(Date.parse(raw))) {
    errors[path] = "Enter a valid date and time.";
    return undefined;
  }

  if (type === "integer" || type === "number") {
    const number = Number(raw);
    if (!Number.isFinite(number) || (type === "integer" && !Number.isInteger(number))) {
      errors[path] = type === "integer" ? "Enter a whole number." : "Enter a number.";
      return undefined;
    }
    return number;
  }

  if (type === "boolean") {
    if (raw !== "true" && raw !== "false") {
      errors[path] = "Enter true or false.";
      return undefined;
    }
    return raw === "true";
  }

  if (type === "object" || type === "array") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (type === "array" && !Array.isArray(parsed)) throw new Error();
      if (
        type === "object" &&
        (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      ) {
        throw new Error();
      }
      return parsed;
    } catch {
      errors[path] = `Enter valid JSON for this ${type}.`;
      return undefined;
    }
  }

  return raw;
}

function schemaType(schema: JsonSchema): string {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== "null") ?? "string";
  }
  return schema.type ?? (schema.properties ? "object" : "string");
}

function inferTemplateSchema(variable: string): JsonSchema {
  const normalized = variable.toLowerCase();
  if (["count", "pagenumber", "pagesize"].includes(normalized)) {
    return { type: "integer" };
  }
  if (["date", "from", "to", "startdate", "enddate"].includes(normalized)) {
    return { type: "string", format: "date" };
  }
  if (normalized === "id") return { type: "string", format: "uuid" };
  return { type: "string" };
}
