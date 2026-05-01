import { ActionPayload, PromptItem, QuickActionType, ResourceItem, SelectedContext, ToolItem } from "../types";

export function getSelectedContext(params: {
  selectedTool: ToolItem | null;
  selectedResource: ResourceItem | null;
  selectedPrompt: PromptItem | null;
}): SelectedContext {
  const { selectedTool, selectedResource, selectedPrompt } = params;

  return selectedResource
    ? {
        type: "resource",
        uri: selectedResource.uri,
        title:
          selectedResource.title ||
          selectedResource.name ||
          selectedResource.uri,
      }
    : selectedPrompt
      ? {
          type: "prompt",
          name: selectedPrompt.name,
        }
      : selectedTool
        ? {
            type: "tool",
            name: selectedTool.name,
          }
        : null;
}

export function buildUserFacingText(payload: ActionPayload) {
  switch (payload.action) {
    case "create-receipt-from-image":
      return `Create receipt from image using image URL "${payload.imageUrl}" and image public ID "${payload.imagePublicId}".`;
    case "receipts-by-category":
      return `Show receipts by category "${payload.category}".`;
    case "receipts-by-id":
      return `Show receipt by ID "${payload.receiptId}".`;
    case "recent-count":
      return `Show ${payload.count} recent receipts.`;
    case "top-10-resource":
      return `Show top ${payload.count} receipts/resources.`;
    case "receipts-by-date-range":
      return `Show receipts from "${payload.startDate}" to "${payload.endDate}".`;
    case "receipts-by-date":
      return `Show receipts for date "${payload.date}".`;
    default:
      return "Run receipt action.";
  }
}

export function inferDialogTypeFromLabel(
  value?: string | null,
): QuickActionType | null {
  const normalized = value?.toLowerCase() ?? "";

  if (
    normalized.includes("create receipt from image") ||
    normalized.includes("receipt from image") ||
    normalized.includes("upload image") ||
    normalized.includes("create_receipt_from_image")
  ) {
    return "create-receipt-from-image";
  }

  if (
    normalized.includes("receipt by category") ||
    normalized.includes("receipts by category") ||
    normalized.includes("retrieve receipts by category") ||
    normalized.includes("receipts_by_category")
  ) {
    return "receipts-by-category";
  }

  if (
    normalized.includes("receipt by id") ||
    normalized.includes("receipts by id") ||
    normalized.includes("get receipt by id") ||
    normalized.includes("retrieve a receipt by id") ||
    normalized.includes("receipt_by_id")
  ) {
    return "receipts-by-id";
  }

  if (
    normalized.includes("date range") ||
    normalized.includes("receipts by date range") ||
    normalized.includes("retrieve receipts within a date range") ||
    normalized.includes("receipts_by_date_range")
  ) {
    return "receipts-by-date-range";
  }

  if (
    normalized.includes("receipts by date") ||
    normalized.includes("receipt by date") ||
    normalized.includes("recent receipt by date") ||
    normalized.includes("retrieve receipts for a specific date") ||
    normalized.includes("receipts_by_date")
  ) {
    return "receipts-by-date";
  }

  if (
    normalized.includes("receipts this month") ||
    normalized.includes("retrieve receipts for this month") ||
    normalized.includes("receipts_this_month")
  ) {
    return "receipts-this-month";
  }

  if (
    normalized.includes("receipts paged") ||
    normalized.includes("receipt page") ||
    normalized.includes("retrieve receipts using resource pagination") ||
    normalized.includes("retrieve receipts using tool pagination") ||
    normalized.includes("receipts_paged_resource") ||
    normalized.includes("receipts_paged_tool")
  ) {
    return "receipts-paged";
  }

  if (normalized.includes("recent receipts") && normalized.includes("count")) {
    return "recent-count";
  }

  if (normalized.includes("recent receipts") && normalized.includes("top 10")) {
    return "top-10-resource";
  }

  if (
    normalized.includes("top 10") ||
    normalized.includes("top ten") ||
    normalized.includes("recent receipts (top 10)")
  ) {
    return "top-10-resource";
  }

  if (normalized.includes("category")) {
    return "receipts-by-category";
  }

  return null;
}
