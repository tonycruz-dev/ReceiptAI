import { ActionPayload, ForcedToolCall } from "./chat-types";

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

function coerceCount(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

export function buildForcedToolCallsFromActionPayload(
  actionPayload: ActionPayload | null | undefined,
): ForcedToolCall[] {
  if (!actionPayload) return [];

  switch (actionPayload.action) {
    case "create-receipt-from-image":
      return [
        buildForcedToolCall(
          "create_receipt_from_image",
          { request: { imageUrl: actionPayload.imageUrl } },
          "action-create-receipt-from-image",
        ),
      ];

    case "receipts-by-category":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://category/{category}",
            values: { category: actionPayload.category },
          },
          "action-receipts-by-category",
        ),
      ];

    case "receipts-by-id":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://by-id/{id}",
            values: { id: actionPayload.receiptId },
          },
          "action-receipt-by-id",
        ),
      ];

    case "recent-count":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://recent/{count}",
            values: { count: String(coerceCount(actionPayload.count, 5)) },
          },
          "action-recent-count",
        ),
      ];

    case "top-10-resource":
      return [
        buildForcedToolCall(
          "mcp_read_resource",
          { uri: "receipt://recent" },
          "action-top-10-resource",
        ),
      ];

    case "receipts-by-date-range":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://date/{from}/{to}",
            values: {
              from: actionPayload.startDate,
              to: actionPayload.endDate,
            },
          },
          "action-receipts-by-date-range",
        ),
      ];

    case "receipts-by-date":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://date/{date}",
            values: { date: actionPayload.date },
          },
          "action-receipts-by-date",
        ),
      ];

    case "receipts-this-month":
      return [
        buildForcedToolCall(
          "mcp_read_resource",
          { uri: "receipt://this-month" },
          "action-receipts-this-month",
        ),
      ];

    case "receipts-paged":
      return [
        buildForcedToolCall(
          "mcp_read_resource_template",
          {
            template: "receipt://page/{pageNumber}/{pageSize}",
            values: {
              pageNumber: String(coerceCount(actionPayload.pageNumber, 1)),
              pageSize: String(coerceCount(actionPayload.pageSize, 10)),
            },
          },
          "action-receipts-paged",
        ),
      ];

    default:
      return [];
  }
}
