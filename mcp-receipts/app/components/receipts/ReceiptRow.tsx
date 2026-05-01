import Image from "next/image";
import { ExternalLink, ChevronDown, ImageIcon, Receipt } from "lucide-react";
import { ReceiptCardData } from "@/lib/types";
import { formatCurrency } from "@/lib/util";

type ReceiptRowProps = {
  receipt: ReceiptCardData;
  expanded: boolean;
  onToggle: () => void;
};

function formatReceiptId(receipt: ReceiptCardData) {
  if (receipt.shortId) return receipt.shortId;
  if (!receipt.id) return "—";
  return receipt.id.length > 10 ? `${receipt.id.slice(0, 8)}…` : receipt.id;
}

export function ReceiptRowSkeleton() {
  return (
    <div className="flex w-full items-center gap-4 px-4 py-4">
      <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-zinc-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-64 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export default function ReceiptRow({
  receipt,
  expanded,
  onToggle,
}: ReceiptRowProps) {
  const hasImage = Boolean(receipt.imageUrl) || Boolean(receipt.hasImage);

  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-center gap-4 p-4">
        <button
          type="button"
          onClick={onToggle}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
          aria-label="Toggle receipt details"
          aria-expanded={expanded}
        >
          {receipt.imageUrl ? (
            <Image
              src={receipt.imageUrl}
              alt={`${receipt.merchantName || "Receipt"} image`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Receipt className="h-6 w-6 text-zinc-400" />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-zinc-950 sm:text-base">
              {receipt.merchantName || "Unknown merchant"}
            </h4>

            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {receipt.category || "Uncategorized"}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>{receipt.purchaseDate || "No date"}</span>
            <span className="text-zinc-300">•</span>
            <span className="font-mono">{formatReceiptId(receipt)}</span>

            {hasImage ? (
              <>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Image available
                </span>
              </>
            ) : null}
          </div>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-500">Total</div>
            <div className="text-base font-semibold text-zinc-950 sm:text-lg">
              {formatCurrency(receipt.totalAmount, receipt.currency)}
            </div>
          </div>

          {receipt.imageUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(receipt.imageUrl!, "_blank", "noopener,noreferrer");
              }}
              aria-label="Open receipt image"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand receipt details"
            aria-expanded={expanded}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
          <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-600">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="font-medium text-zinc-900">Receipt ID:</span>{" "}
                <span className="font-mono">{receipt.id || "—"}</span>
              </div>

              <div>
                <span className="font-medium text-zinc-900">Date:</span>{" "}
                {receipt.purchaseDate || "—"}
              </div>

              <div>
                <span className="font-medium text-zinc-900">Category:</span>{" "}
                {receipt.category || "Uncategorized"}
              </div>

              <div>
                <span className="font-medium text-zinc-900">Image:</span>{" "}
                {hasImage ? "Available" : "None"}
              </div>
            </div>

            {receipt.imageUrl ? (
              <button
                type="button"
                onClick={() =>
                  window.open(
                    receipt.imageUrl!,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open image
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
