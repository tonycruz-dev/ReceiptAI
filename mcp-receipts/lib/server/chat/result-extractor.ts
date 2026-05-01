import { cleanReceipt, formatReceiptsForModel } from "./receipt-normalizer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseToolArguments(
  args: string | undefined,
): Record<string, unknown> {
  if (!args) return {};

  try {
    const parsed = JSON.parse(args);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryExtractStructuredResult(result: any): any {
  if (!result) return null;

  if (result.structuredContent) {
    return result.structuredContent;
  }

  if (Array.isArray(result.content)) {
    const textItem = result.content.find(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "text" in item &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).type === "text",
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (textItem as any)?.text;

    if (typeof text === "string") {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isReceiptLike(item: any): boolean {
  return (
    item &&
    typeof item === "object" &&
    ("merchantName" in item ||
      "purchaseDate" in item ||
      "totalAmount" in item ||
      "imageUrl" in item)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractReceiptArray(structured: any): any[] | null {
  if (!structured) return null;

  if (Array.isArray(structured) && structured.every(isReceiptLike)) {
    return structured;
  }

  if (
    typeof structured === "object" &&
    structured !== null &&
    Array.isArray(structured.result) &&
    structured.result.every(isReceiptLike)
  ) {
    return structured.result;
  }

  if (
    typeof structured === "object" &&
    structured !== null &&
    Array.isArray(structured.items) &&
    structured.items.every(isReceiptLike)
  ) {
    return structured.items;
  }

  if (
    typeof structured === "object" &&
    structured !== null &&
    isReceiptLike(structured.result)
  ) {
    return [structured.result];
  }

  if (isReceiptLike(structured)) {
    return [structured];
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryParseJson(value: any): any | null {
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractReceiptsFromUnknown(value: any): any[] | null {
  if (!value) return null;

  const direct = extractReceiptArray(value);
  if (direct?.length) return direct;

  if (typeof value === "object" && value !== null) {
    if ("result" in value) {
      const fromResult = extractReceiptsFromUnknown(value.result);
      if (fromResult?.length) return fromResult;
    }

    if ("structuredContent" in value) {
      const fromStructured = extractReceiptsFromUnknown(
        value.structuredContent,
      );
      if (fromStructured?.length) return fromStructured;
    }

    if (Array.isArray(value.contents)) {
      for (const item of value.contents) {
        const fromItem = extractReceiptsFromUnknown(item);
        if (fromItem?.length) return fromItem;
      }
    }

    if (Array.isArray(value.content)) {
      for (const item of value.content) {
        const fromItem = extractReceiptsFromUnknown(item);
        if (fromItem?.length) return fromItem;
      }
    }

    if (typeof value.text === "string") {
      const parsed = tryParseJson(value.text);
      const fromParsed = extractReceiptsFromUnknown(parsed);
      if (fromParsed?.length) return fromParsed;
    }

    if (typeof value.data === "string") {
      const parsed = tryParseJson(value.data);
      const fromParsed = extractReceiptsFromUnknown(parsed);
      if (fromParsed?.length) return fromParsed;
    }
  }

  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    const fromParsed = extractReceiptsFromUnknown(parsed);
    if (fromParsed?.length) return fromParsed;
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringifyContentParts(content: any): string {
  if (!Array.isArray(content)) return JSON.stringify(content, null, 2);

  const textParts = content
    .map((item: unknown) => {
      if (typeof item === "string") return item;

      if (
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "text" in item &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).type === "text"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any).text as string;
      }

      return JSON.stringify(item);
    })
    .filter(Boolean);

  return textParts.length
    ? textParts.join("\n")
    : JSON.stringify(content, null, 2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTextFromAnyResult(result: any): string {
  if (!result) return "No result.";

  const receipts = extractReceiptsFromUnknown(result);

  if (receipts?.length) {
    return formatReceiptsForModel(receipts.map(cleanReceipt));
  }

  const structured = tryExtractStructuredResult(result);

  if (typeof result === "string") return result;
  if (structured) return JSON.stringify(structured, null, 2);
  if (Array.isArray(result.content))
    return stringifyContentParts(result.content);

  return JSON.stringify(result, null, 2);
}
