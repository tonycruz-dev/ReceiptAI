"use client";

import { useEffect, useRef, useState } from "react";
import ChatWindow from "@/app/components/chat/ChatWindow";
import Composer from "@/app/components/chat/Composer";
import QuickActions from "@/app/components/chat/QuickActions";
import CapabilityDialog from "@/app/components/CapabilityDialog";
import {
  buildPromptArguments,
  buildToolArguments,
  getPromptFields,
  getTemplateFields,
  getToolFields,
  isMutationTool,
  resolveResourceTemplate,
  type CapabilityField,
} from "@/lib/mcp/capability-utils";
import { callTool, getPrompt, readResource } from "@/lib/mcp/browser-client";
import { buildAssistantMessage, postChatRequest } from "@/lib/receipt-chat/chat-api";
import type {
  CatalogResponse,
  ChatMessage,
  McpPromptMessage,
  McpSelection,
  MenuKey,
  QuickActionType,
  ReceiptCardData,
} from "@/lib/types";

const emptyCatalog: CatalogResponse = {
  tools: [],
  resources: [],
  resourceTemplates: [],
  prompts: [],
};

export default function Home() {
  const [catalog, setCatalog] = useState<CatalogResponse>(emptyCatalog);
  const [selection, setSelection] = useState<McpSelection | null>(null);
  const [dialogSelection, setDialogSelection] = useState<McpSelection | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about receipts or select a specific MCP tool, resource, template, or prompt.",
      toolData: null,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mcp/catalog", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as CatalogResponse & { error?: string };
        if (!response.ok) throw new Error(data.error || "Failed to load MCP catalog.");
        if (!cancelled) setCatalog(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCatalogError(error instanceof Error ? error.message : "Catalog failed.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const fields = getFields(dialogSelection);
  const mutation =
    dialogSelection?.kind === "tool" && isMutationTool(dialogSelection);

  function chooseCapability(nextSelection: McpSelection) {
    setSelection(nextSelection);
    setDialogSelection(nextSelection);
    setFieldValues(defaultValues(nextSelection));
    setFieldErrors({});
    setConfirmed(false);
    setOpenMenu(null);
  }

  async function executeCapability() {
    const target = dialogSelection;
    if (!target || sending) return;
    setFieldErrors({});

    if (target.kind === "tool") {
      const validation = buildToolArguments(target, fieldValues);
      if (!validation.ok) return setFieldErrors(validation.errors);
      if (isMutationTool(target) && !confirmed) {
        return setFieldErrors({ _form: "Confirm this mutation before running it." });
      }
      await runOperation(
        `Tool: ${target.title || target.name}`,
        () => callTool({ name: target.name, arguments: validation.value, confirmed }),
      );
      return;
    }

    if (target.kind === "resource") {
      await runOperation(
        `Resource: ${target.title || target.name}`,
        () => readResource({ uri: target.uri }),
        target.uri,
      );
      return;
    }

    if (target.kind === "resourceTemplate") {
      const resolved = resolveResourceTemplate(target, fieldValues);
      if (!resolved.ok) return setFieldErrors(resolved.errors);
      await runOperation(
        `Resource: ${target.title || target.name} (${resolved.value})`,
        () => readResource({ uri: resolved.value }),
        resolved.value,
      );
      return;
    }

    const validation = buildPromptArguments(target, fieldValues);
    if (!validation.ok) return setFieldErrors(validation.errors);
    await applyPrompt(target.name, validation.value);
  }

  async function runOperation(
    label: string,
    operation: () => Promise<unknown>,
    resourceUri?: string,
  ) {
    setSending(true);
    try {
      const result = await operation();
      const receipts = resourceUri
        ? parseReceiptResource(result, resourceUri)
        : undefined;
      setDialogSelection(null);
      setMessages((current) => [
        ...current,
        { role: "user", content: label, toolData: null },
        {
          role: "assistant",
          content: receipts ? "" : formatResult(result),
          toolData: receipts ? { receipts } : null,
        },
      ]);
    } catch (error) {
      setFieldErrors({
        _form: error instanceof Error ? error.message : "MCP operation failed.",
      });
    } finally {
      setSending(false);
    }
  }

  async function applyPrompt(name: string, args: Record<string, string>) {
    setSending(true);
    try {
      const prompt = await getPrompt({ name, arguments: args });
      const promptMessages = prompt.messages.map(toChatMessage);
      const appliedNotice: ChatMessage = {
        role: "assistant",
        content: `Applied MCP prompt "${name}" (${prompt.messages.length} message${prompt.messages.length === 1 ? "" : "s"}).`,
        toolData: null,
      };
      const visibleMessages = [...messages, appliedNotice];
      setMessages(visibleMessages);
      setDialogSelection(null);

      const response = await postChatRequest({
        messages: [
          ...messages.map(({ role, content }) => ({ role, content })),
          ...promptMessages,
        ],
      });
      setMessages([...visibleMessages, buildAssistantMessage(response)]);
    } catch (error) {
      setFieldErrors({
        _form: error instanceof Error ? error.message : "Prompt retrieval failed.",
      });
    } finally {
      setSending(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user" as const, content: text, toolData: null }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const result = await postChatRequest({
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      setMessages([...next, buildAssistantMessage(result)]);
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: error instanceof Error ? `Error: ${error.message}` : "Chat failed.",
          toolData: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleQuickAction(action: QuickActionType) {
    const capability = quickActionCapability(action, catalog);
    if (capability) chooseCapability(capability);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0,transparent_32rem)] text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:py-8">
        <ChatWindow
          messages={messages}
          sending={sending}
          messagesEndRef={messagesEndRef}
        />
        <div className="sticky bottom-0 z-10 -mx-3 bg-linear-to-t from-zinc-50 via-zinc-50/95 to-transparent px-3 pb-3 pt-3 sm:-mx-6 sm:px-6 sm:pb-4">
          <QuickActions
            onAction={handleQuickAction}
            disabled={loading || sending}
          />
          <div className="mt-3">
            <Composer
              input={input}
              setInput={setInput}
              sending={sending}
              onSend={() => void sendMessage()}
              selection={selection}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              catalog={catalog}
              loading={loading}
              error={catalogError}
              search={search}
              setSearch={setSearch}
              onSelect={chooseCapability}
              onClearSelection={() => setSelection(null)}
            />
          </div>
        </div>
      </main>
      <CapabilityDialog
        selection={dialogSelection}
        fields={fields}
        values={fieldValues}
        errors={fieldErrors}
        mutation={Boolean(mutation)}
        confirmed={confirmed}
        busy={sending}
        onValueChange={(path, value) => {
          setFieldValues((current) => ({ ...current, [path]: value }));
          setFieldErrors((current) => ({ ...current, [path]: "", _form: "" }));
        }}
        onConfirmedChange={setConfirmed}
        onClose={() => setDialogSelection(null)}
        onSubmit={() => void executeCapability()}
      />
    </div>
  );
}

function getFields(selection: McpSelection | null): CapabilityField[] {
  if (!selection || selection.kind === "resource") return [];
  if (selection.kind === "tool") return getToolFields(selection);
  if (selection.kind === "resourceTemplate") return getTemplateFields(selection);
  return getPromptFields(selection);
}

function defaultValues(selection: McpSelection) {
  const result: Record<string, string> = {};
  for (const field of getFields(selection)) {
    if (field.schema.default !== undefined) result[field.path] = String(field.schema.default);
    else if (field.path.endsWith("pageNumber")) result[field.path] = "1";
    else if (field.path.endsWith("pageSize")) result[field.path] = "10";
  }
  return result;
}

function toChatMessage(message: McpPromptMessage) {
  if (message.content.type === "text" && typeof message.content.text === "string") {
    return { role: message.role, content: message.content.text };
  }
  if (message.content.type === "resource") {
    const resource = message.content.resource;
    if (resource && typeof resource === "object" && "text" in resource) {
      return { role: message.role, content: String(resource.text) };
    }
  }
  throw new Error(`Unsupported MCP prompt content type: ${message.content.type}`);
}

function formatResult(result: unknown): string {
  return `MCP operation completed.\n\n${JSON.stringify(result, null, 2)}`;
}

function parseReceiptResource(
  response: unknown,
  uri: string,
): ReceiptCardData[] | undefined {
  if (!uri.startsWith("receipt://") || !isRecord(response)) return undefined;

  const result = response.result;
  if (!isRecord(result) || !Array.isArray(result.contents)) return undefined;

  const content = result.contents[0];
  if (
    !isRecord(content) ||
    content.mimeType !== "application/json" ||
    typeof content.text !== "string"
  ) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(content.text);
    if (!Array.isArray(parsed)) return undefined;

    const receipts = parsed.map(toReceiptCardData);
    return receipts.every((receipt) => receipt !== undefined)
      ? receipts
      : undefined;
  } catch {
    return undefined;
  }
}

function toReceiptCardData(value: unknown): ReceiptCardData | undefined {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.merchantName !== "string" ||
    typeof value.purchaseDate !== "string" ||
    (typeof value.totalAmount !== "number" &&
      typeof value.totalAmount !== "string") ||
    typeof value.currency !== "string" ||
    typeof value.category !== "string" ||
    (value.imageUrl !== undefined &&
      value.imageUrl !== null &&
      typeof value.imageUrl !== "string")
  ) {
    return undefined;
  }

  return {
    id: value.id,
    shortId: value.id.slice(0, 8),
    merchantName: value.merchantName,
    purchaseDate: value.purchaseDate,
    totalAmount: value.totalAmount,
    currency: value.currency,
    category: value.category,
    hasImage: Boolean(value.imageUrl),
    imageUrl: value.imageUrl ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function quickActionCapability(action: QuickActionType, catalog: CatalogResponse) {
  const resourceUri: Partial<Record<QuickActionType, string>> = {
    summary: "receipt://summary",
    "recent-receipts": "receipt://recent",
  };
  const templateUri: Partial<Record<QuickActionType, string>> = {
    "receipts-by-category": "receipt://category/{category}",
    "receipts-by-date": "receipt://date/{date}",
  };
  if (action === "create-receipt-from-image") {
    return catalog.tools.find((tool) => tool.name === "create_receipt_from_image");
  }
  if (resourceUri[action]) {
    return catalog.resources.find((resource) => resource.uri === resourceUri[action]);
  }
  if (templateUri[action]) {
    return catalog.resourceTemplates.find(
      (template) => template.uriTemplate === templateUri[action],
    );
  }
  return undefined;
}
