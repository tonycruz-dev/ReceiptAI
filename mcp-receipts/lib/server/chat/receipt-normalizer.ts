import { CleanReceipt } from "./chat-types";

export function shortenId(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 8) : "";
}

export function normalizeDate(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanReceipt(receipt: any): CleanReceipt {
  return {
    id: typeof receipt.id === "string" ? receipt.id : "",
    shortId: shortenId(receipt.id),
    merchantName:
      typeof receipt.merchantName === "string"
        ? receipt.merchantName
        : "Unknown",
    purchaseDate: normalizeDate(receipt.purchaseDate),
    totalAmount:
      typeof receipt.totalAmount === "number" ||
      typeof receipt.totalAmount === "string"
        ? receipt.totalAmount
        : "",
    currency: typeof receipt.currency === "string" ? receipt.currency : "",
    category: typeof receipt.category === "string" ? receipt.category : "",
    hasImage: Boolean(receipt.imageUrl),
    imageUrl: typeof receipt.imageUrl === "string" ? receipt.imageUrl : null,
  };
}

export function dedupeReceipts(receipts: CleanReceipt[]): CleanReceipt[] {
  const seen = new Set<string>();

  return receipts.filter((receipt) => {
    const key =
      receipt.id ||
      `${receipt.merchantName}-${receipt.purchaseDate}-${receipt.totalAmount}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function formatReceiptsForModel(receipts: CleanReceipt[]): string {
  return JSON.stringify(
    {
      receiptCount: receipts.length,
      receipts: receipts.map((receipt, index) => ({
        number: index + 1,
        shortId: receipt.shortId,
        merchant: receipt.merchantName,
        date: receipt.purchaseDate,
        amount: receipt.totalAmount,
        currency: receipt.currency,
        category: receipt.category,
        hasImage: receipt.hasImage,
      })),
    },
    null,
    2,
  );
}
