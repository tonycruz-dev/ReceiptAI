import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDate,
  getSafeCategory,
  getSafeMerchantName,
  type ReceiptLike,
} from "../../utils/receiptFormatters";

type ReceiptCardProps = {
  receipt: ReceiptLike;
};

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const merchantName = getSafeMerchantName(receipt?.merchantName);
  const category = getSafeCategory(receipt?.category);
  const total = formatCurrency(
    receipt?.totalAmount,
    receipt?.currency || "GBP",
  );
  const purchaseDate = formatDate(receipt?.purchaseDate);

  return (
    <Link
      key={receipt.id}
      to={`/receipts/${receipt.id}`}
      className="group overflow-hidden rounded-4xl border border-white/80 bg-white/90 shadow-lg shadow-slate-200/70 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        {receipt?.imageUrl ? (
          <img
            src={receipt.imageUrl}
            alt={`Receipt from ${merchantName}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ReceiptImagePlaceholder />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-950/35 via-slate-900/5 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-lg">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950">
              {merchantName}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {purchaseDate}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right ring-1 ring-inset ring-slate-100">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-base font-semibold text-slate-950">
              {total}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">Open receipt details</span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition group-hover:text-slate-950">
            View details
            <span
              aria-hidden="true"
              className="transition duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ReceiptImagePlaceholder() {
  return (
    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-slate-200">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-8 w-6 rounded-lg border-2 border-slate-300 bg-slate-50">
            <div className="absolute left-1 right-1 top-1.5 h-1 rounded-full bg-slate-200" />
            <div className="absolute left-1 right-2 top-4 h-1 rounded-full bg-slate-200" />
            <div className="absolute bottom-1.5 left-1 h-1 w-2 rounded-full bg-slate-300" />
          </div>
        </div>

        <span className="text-sm font-medium">No image available</span>
      </div>
    </div>
  );
}
