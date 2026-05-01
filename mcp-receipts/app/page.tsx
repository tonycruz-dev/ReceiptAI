"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogResponse, MenuKey, ToolItem, ResourceItem, PromptItem, ChatMessage, QuickActionType, ActionPayload,} from "@/lib/types";
import ChatWindow from "@/app/components/chat/ChatWindow";
import Composer from "@/app/components/chat/Composer";
import QuickActions from "@/app/components/chat/QuickActions";
import DialogRenderer from "@/app/components/chat/DialogRenderer";
import {buildUserFacingText, getSelectedContext, inferDialogTypeFromLabel,} from "@/lib/receipt-chat/helpers";
import {buildAssistantMessage, postChatRequest,} from "@/lib/receipt-chat/chat-api";

type UploadResponse = {
  publicId: string | null;
  url: string | null;
  error: string | null;
};

export default function Home() {
  const [catalog, setCatalog] = useState<CatalogResponse>({
    tools: [],
    resources: [],
    prompts: [],
    resourceTemplates: [],
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(
    null,
  );
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about receipts, browse MCP tools, open resources, or use prompts from the menu.",
      toolData: null,
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [activeDialog, setActiveDialog] = useState<QuickActionType | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [receiptIdInput, setReceiptIdInput] = useState("");
  const [recentCountInput, setRecentCountInput] = useState("5");
  const [topCountInput, setTopCountInput] = useState("10");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [pageNumberInput, setPageNumberInput] = useState("1");
  const [pageSizeInput, setPageSizeInput] = useState("10");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/mcp/catalog", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load MCP catalog");
        }

        const data: CatalogResponse = await res.json();
        console.log("[MCP Catalog] Loaded catalog:", data);

        if (!cancelled) {
          setCatalog({
            tools: data.tools ?? [],
            resources: data.resources ?? [],
            prompts: data.prompts ?? [],
            resourceTemplates: data.resourceTemplates ?? [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredTools = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return catalog.tools;

    return catalog.tools.filter((tool) =>
      [tool.name, tool.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [catalog.tools, search]);

  const filteredResources = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return catalog.resources;

    return catalog.resources.filter((resource) =>
      [
        resource.name,
        resource.title,
        resource.uri,
        resource.description,
        resource.mimeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [catalog.resources, search]);

  const filteredPrompts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return catalog.prompts;

    return catalog.prompts.filter((prompt) =>
      [prompt.name, prompt.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [catalog.prompts, search]);

  function resetDialogFields() {
    setSelectedImage(null);
    setCategoryInput("");
    setReceiptIdInput("");
    setRecentCountInput("5");
    setTopCountInput("10");
    setStartDate("");
    setEndDate("");
    setSingleDate("");
  }

  function closeDialog() {
    setActiveDialog(null);
    resetDialogFields();
  }

  async function sendMessage(prefilled?: string) {
    const text = (prefilled ?? input).trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, toolData: null },
    ];

    const selectedContext = getSelectedContext({
      selectedTool,
      selectedResource,
      selectedPrompt,
    });

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const data = await postChatRequest({
        messages: nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        selectedContext,
      });

      setMessages([...nextMessages, buildAssistantMessage(data)]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Error: ${err.message}`
              : "Something went wrong.",
          toolData: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function sendStructuredToolMessage(payload: ActionPayload) {
    if (sending) return;

    const text = buildUserFacingText(payload);
    const selectedContext = getSelectedContext({
      selectedTool,
      selectedResource,
      selectedPrompt,
    });

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, toolData: null },
    ];

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const data = await postChatRequest({
        messages: nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        selectedContext,
        actionPayload: payload,
      });

      setMessages([...nextMessages, buildAssistantMessage(data)]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Error: ${err.message}`
              : "Something went wrong.",
          toolData: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleQuickAction(actionType: QuickActionType) {
    switch (actionType) {
      case "summary":
        setSelectedResource({
          type: "resource",
          name: "Receipt Summary",
          uri: "receipt://summary",
          mimeType: "application/json",
        } as ResourceItem);
        setSelectedTool(null);
        setSelectedPrompt(null);
        void sendStructuredToolMessage({
          action: "top-10-resource",
          count: 10,
        });
        break;

      case "recent-receipts":
        setSelectedResource({
          type: "resource",
          name: "Recent Receipts (Top 10)",
          uri: "receipt://recent",
          mimeType: "application/json",
        } as ResourceItem);
        setSelectedTool(null);
        setSelectedPrompt(null);
        void sendStructuredToolMessage({
          action: "top-10-resource",
          count: 10,
        });
        break;

      case "create-receipt-from-image":
      case "receipts-by-category":
      case "receipts-by-date-range":
      case "receipts-by-date":
      case "receipts-by-id":
      case "recent-count":
      case "top-10-resource":
        resetDialogFields();
        setActiveDialog(actionType);
        break;

      default:
        break;
    }
  }

  function handleToolSelect(tool: ToolItem) {
    setSelectedTool(tool);
    setSelectedResource(null);
    setSelectedPrompt(null);
    setOpenMenu(null);

    const dialogType = inferDialogTypeFromLabel(
      `${tool.name} ${tool.description ?? ""}`,
    );

    if (dialogType) {
      resetDialogFields();
      setActiveDialog(dialogType);
      return;
    }

    setInput(`Use the tool "${tool.name}" to help me with: `);
  }

  function handleResourceSelect(resource: ResourceItem) {
    setSelectedResource(resource);
    setSelectedTool(null);
    setSelectedPrompt(null);
    setOpenMenu(null);

    const uri = resource.uri?.toLowerCase() ?? "";
    const label = [
      resource.title,
      resource.name,
      resource.description,
      resource.uri,
    ]
      .filter(Boolean)
      .join(" ");

    if (uri === "receipt://summary") {
      void sendMessage("Show the receipt summary.");
      return;
    }

    if (uri === "receipt://recent") {
      void sendMessage("Show the recent receipts.");
      return;
    }

    if (uri === "receipt://all") {
      void sendMessage("Show all receipts.");
      return;
    }

    if (uri === "receipt://this-month") {
      void sendMessage("Show receipts for this month.");
      return;
    }

    if (uri.includes("receipt://date/{from}/{to}")) {
      resetDialogFields();
      setActiveDialog("receipts-by-date-range");
      return;
    }

    if (uri.includes("receipt://recent/{count}")) {
      resetDialogFields();
      setActiveDialog("recent-count");
      return;
    }

    if (uri.includes("receipt://by-id/{id}")) {
      resetDialogFields();
      setActiveDialog("receipts-by-id");
      return;
    }

    if (uri.includes("receipt://date/{date}")) {
      resetDialogFields();
      setActiveDialog("receipts-by-date");
      return;
    }

    if (uri.includes("receipt://category/{category}")) {
      resetDialogFields();
      setActiveDialog("receipts-by-category");
      return;
    }

    const dialogType = inferDialogTypeFromLabel(label);

    if (dialogType) {
      resetDialogFields();
      setActiveDialog(dialogType);
      return;
    }

    setInput(
      `Use the resource "${resource.title || resource.name || resource.uri}" to help me with: `,
    );
  }

  function handlePromptSelect(prompt: PromptItem) {
    setSelectedPrompt(prompt);
    setSelectedTool(null);
    setSelectedResource(null);
    setOpenMenu(null);

    const normalized =
      `${prompt.name} ${prompt.title ?? ""} ${prompt.description ?? ""}`.toLowerCase();

    if (normalized.includes("date range")) {
      resetDialogFields();
      setActiveDialog("receipts-by-date-range");
      return;
    }

    if (normalized.includes("extract") && normalized.includes("create")) {
      resetDialogFields();
      setActiveDialog("create-receipt-from-image");
      return;
    }

    const dialogType = inferDialogTypeFromLabel(
      `${prompt.name} ${prompt.description ?? ""}`,
    );

    if (dialogType) {
      resetDialogFields();
      setActiveDialog(dialogType);
      return;
    }

    setInput(`Use the prompt "${prompt.name}" for: `);
  }

  async function uploadSelectedImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/images", {
      method: "POST",
      body: formData,
    });

    const data = (await uploadRes.json()) as UploadResponse;

    if (!uploadRes.ok) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data;
  }

  async function submitDialogAction() {
    if (!activeDialog) return;

    if (activeDialog === "create-receipt-from-image") {
      if (!selectedImage) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please select an image first.",
            toolData: null,
          },
        ]);
        return;
      }

      try {
        setSending(true);

        const uploadData = await uploadSelectedImage(selectedImage);

        if (!uploadData?.url || !uploadData?.publicId) {
          throw new Error(
            "Upload succeeded but no image URL/public ID was returned.",
          );
        }

        closeDialog();

        await sendStructuredToolMessage({
          action: "create-receipt-from-image",
          imageUrl: uploadData.url,
          imagePublicId: uploadData.publicId,
        });
      } catch (err) {
        setSending(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              err instanceof Error ? `Error: ${err.message}` : "Upload failed.",
            toolData: null,
          },
        ]);
      }

      return;
    }

    if (activeDialog === "receipts-by-category") {
      const category = categoryInput.trim();
      if (!category) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-by-category",
        category,
      });
      return;
    }

    if (activeDialog === "receipts-by-id") {
      const receiptId = receiptIdInput.trim();
      if (!receiptId) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-by-id",
        receiptId,
      });
      return;
    }

    if (activeDialog === "recent-count") {
      const count = Number(recentCountInput);
      if (!Number.isFinite(count) || count <= 0) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "recent-count",
        count,
      });
      return;
    }

    if (activeDialog === "top-10-resource") {
      const count = Number(topCountInput);
      if (!Number.isFinite(count) || count <= 0) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "top-10-resource",
        count,
      });
      return;
    }

    if (activeDialog === "receipts-by-date") {
      if (!singleDate) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-by-date",
        date: singleDate,
      });
      return;
    }

    if (activeDialog === "receipts-by-date-range") {
      if (!startDate || !endDate) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-by-date-range",
        startDate,
        endDate,
      });
    }

    if (activeDialog === "receipts-paged") {
      const pageNumber = Number(pageNumberInput);
      const pageSize = Number(pageSizeInput);
      if (!Number.isFinite(pageNumber) || pageNumber <= 0) return;
      if (!Number.isFinite(pageSize) || pageSize <= 0) return;

      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-paged",
        pageNumber,
        pageSize,
      });
    }
    if (activeDialog === "receipts-this-month") {
      closeDialog();
      await sendStructuredToolMessage({
        action: "receipts-this-month",
      });
    }

  }

  const selectedLabel = selectedTool
    ? `Tool: ${selectedTool.name}`
    : selectedResource
      ? `Resource: ${selectedResource.title || selectedResource.name || selectedResource.uri}`
      : selectedPrompt
        ? `Prompt: ${selectedPrompt.name}`
        : "No item selected";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
        <ChatWindow
          messages={messages}
          sending={sending}
          messagesEndRef={messagesEndRef}
        />

        <div className="sticky bottom-0 z-10 -mx-4 bg-linear-to-t from-zinc-50 via-zinc-50/95 to-transparent px-4 pb-6 pt-4">
          <QuickActions onAction={handleQuickAction} />

          <div className="mt-4">
            <Composer
              input={input}
              setInput={setInput}
              sending={sending}
              onSend={() => void sendMessage()}
              selectedLabel={selectedLabel}
              menuRef={menuRef}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              catalog={catalog}
              loading={loading}
              error={error}
              search={search}
              setSearch={setSearch}
              filteredTools={filteredTools}
              filteredResources={filteredResources}
              filteredPrompts={filteredPrompts}
              selectedTool={selectedTool}
              selectedResource={selectedResource}
              selectedPrompt={selectedPrompt}
              onToolSelect={handleToolSelect}
              onResourceSelect={handleResourceSelect}
              onPromptSelect={handlePromptSelect}
            />
          </div>
        </div>
      </main>

      <DialogRenderer
        activeDialog={activeDialog}
        closeDialog={closeDialog}
        submitDialogAction={() => void submitDialogAction()}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        categoryInput={categoryInput}
        setCategoryInput={setCategoryInput}
        receiptIdInput={receiptIdInput}
        setReceiptIdInput={setReceiptIdInput}
        recentCountInput={recentCountInput}
        setRecentCountInput={setRecentCountInput}
        topCountInput={topCountInput}
        setTopCountInput={setTopCountInput}
        singleDate={singleDate}
        setSingleDate={setSingleDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        pageNumberInput={pageNumberInput}
        setPageNumberInput={setPageNumberInput}
        pageSizeInput={pageSizeInput}
        setPageSizeInput={setPageSizeInput}
      />
    </div>
  );
}

