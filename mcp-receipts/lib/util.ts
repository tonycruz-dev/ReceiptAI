export function formatCurrency(amount: number | string, currency?: string) {
  const numeric =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;

  if (Number.isNaN(numeric)) return String(amount ?? "");

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
    }).format(numeric);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}
