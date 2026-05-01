export type ReceiptLike = {
  id: string | number;
  merchantName?: string | null;
  category?: string | null;
  totalAmount?: number | string | null;
  currency?: string | null;
  purchaseDate?: string | null;
  imageUrl?: string | null;
};

export const PAGE_SHELL_CLASS_NAME =
  "relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200";

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string | null | undefined = "GBP",
) {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  const safeCurrency =
    typeof currencyCode === "string" && currencyCode.trim()
      ? currencyCode
      : "GBP";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: safeCurrency,
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "GBP",
    }).format(safeAmount);
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function getSafeMerchantName(merchantName: string | null | undefined) {
  return typeof merchantName === "string" && merchantName.trim()
    ? merchantName
    : "Unknown merchant";
}

export function getSafeCategory(category: string | null | undefined) {
  return typeof category === "string" && category.trim()
    ? category
    : "Uncategorised";
}

export function getLatestReceiptDateValue(receipts: ReceiptLike[]) {
  return receipts.reduce<string | null>((latest, receipt) => {
    if (!receipt?.purchaseDate) return latest;

    const currentTime = new Date(receipt.purchaseDate).getTime();

    if (!Number.isFinite(currentTime)) return latest;

    if (!latest) return receipt.purchaseDate;

    const latestTime = new Date(latest).getTime();

    return currentTime > latestTime ? receipt.purchaseDate : latest;
  }, null);
}
