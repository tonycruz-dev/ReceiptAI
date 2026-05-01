export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function formatAmount(currency: string, amount: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
