import { ReceiptCardData } from "@/lib/types";
import { formatCurrency } from "@/lib/util";
import Image from "next/image";
import {
  CalendarDays,
  ExternalLink,
  ImageIcon,
  Receipt,
  Tag,
} from "lucide-react";

type ReceiptCardProps = {
  receipt: ReceiptCardData;
  onOpenImage?: (receipt: ReceiptCardData) => void;
  showOpenImageLink?: boolean;
};

/**
 * Small reusable metadata chip for compact, modern inline details.
 */
function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-zinc-700 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900/5">
        <Icon className="h-4 w-4 text-zinc-600" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </p>
        <p className="truncate font-medium text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

/**
 * Color-mapped category badge to create clearer visual distinction
 * without becoming too loud or overpowering.
 */
function getCategoryStyles(category?: string) {
  const value = category?.toLowerCase().trim();

  if (!value) {
    return "border-zinc-200/80 bg-white/80 text-zinc-700";
  }

  if (
    ["travel", "transport", "taxi", "flight", "uber", "lyft"].includes(value)
  ) {
    return "border-sky-200/80 bg-sky-50/90 text-sky-700";
  }

  if (["food", "dining", "restaurant", "groceries", "meal"].includes(value)) {
    return "border-amber-200/80 bg-amber-50/90 text-amber-700";
  }

  if (["software", "saas", "subscription", "tech"].includes(value)) {
    return "border-violet-200/80 bg-violet-50/90 text-violet-700";
  }

  if (["office", "supplies", "equipment"].includes(value)) {
    return "border-emerald-200/80 bg-emerald-50/90 text-emerald-700";
  }

  if (["health", "medical", "wellness"].includes(value)) {
    return "border-rose-200/80 bg-rose-50/90 text-rose-700";
  }

  return "border-zinc-200/80 bg-white/80 text-zinc-700";
}

/**
 * Optional skeleton state for future loading usage.
 * Not wired into props to preserve the existing API exactly as requested.
 */
export function ReceiptCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-lg shadow-zinc-950/5 ring-1 ring-black/3 backdrop-blur-sm">
      <div className="h-52 animate-pulse bg-zinc-100" />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-4 w-24 animate-pulse rounded-xl bg-zinc-100" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-2xl bg-zinc-100" />
        </div>

        <div className="h-10 w-32 animate-pulse rounded-2xl bg-zinc-100" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

export default function ReceiptCard({
  receipt,
  onOpenImage,
  showOpenImageLink = true,
}: ReceiptCardProps) {
  const handleOpenImage = () => {
    if (onOpenImage) {
      onOpenImage(receipt);
      return;
    }

    if (receipt.imageUrl) {
      window.open(receipt.imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  const categoryLabel = receipt.category || "Uncategorized";
  const categoryStyles = getCategoryStyles(receipt.category);

  return (
    <article
      className="
        group relative overflow-hidden rounded-[28px]
        border border-white/60 bg-linear-to-b from-white to-zinc-50/80
        shadow-lg shadow-zinc-950/5 ring-1 ring-black/3
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10
      "
    >
      {/* Soft ambient gradient to give the card a more premium SaaS feel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(244,244,245,0.8),transparent_30%)]" />

      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden sm:h-56">
        {receipt.imageUrl ? (
          <>
            <Image
              src={receipt.imageUrl}
              alt={`${receipt.merchantName} receipt`}
              fill
              unoptimized
              className="
                object-cover transition-transform duration-500 ease-out
                group-hover:scale-[1.04]
              "
            />

            {/* Gradient overlays improve readability over image content */}
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-black/5" />
            <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-zinc-100 via-zinc-50 to-white">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur-sm">
                <Receipt className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">
                  No receipt image
                </p>
                <p className="text-xs text-zinc-400">Preview unavailable</p>
              </div>
            </div>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute left-4 top-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md ${categoryStyles}`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>{categoryLabel}</span>
          </div>
        </div>

        {/* Top-right image action for cleaner, app-like affordance */}
        {receipt.imageUrl && showOpenImageLink ? (
          <button
            type="button"
            onClick={handleOpenImage}
            aria-label="Open receipt image"
            className="
              absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center
              rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md
              transition-all duration-200 ease-out
              hover:scale-105 hover:bg-black/40
              focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black/10
            "
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        ) : null}

        {/* Bottom content over image for stronger hierarchy */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Merchant
            </p>
            <h3 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {receipt.merchantName}
            </h3>
            <p className="mt-1 truncate text-sm text-white/70">
              ID: {receipt.shortId || receipt.id}
            </p>
          </div>

          {/* Amount is intentionally the most visually dominant data point */}
          <div className="shrink-0 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-right shadow-sm backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Total
            </p>
            <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {formatCurrency(receipt.totalAmount, receipt.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative space-y-4 p-4 sm:p-5">
        {/* Modern metadata chips instead of a plain 2-column grid */}
        <div className="flex flex-wrap gap-3">
          <MetaChip
            icon={CalendarDays}
            label="Date"
            value={receipt.purchaseDate || "—"}
          />

          <MetaChip
            icon={ImageIcon}
            label="Image"
            value={receipt.imageUrl ? "Available" : "Not attached"}
          />
        </div>

        {/* Secondary action row for accessibility and mobile discoverability.
            Keeps original functionality while complementing the overlay action. */}
        {receipt.imageUrl && showOpenImageLink ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpenImage}
              className="
                inline-flex items-center gap-2 rounded-2xl
                border border-zinc-200 bg-white px-4 py-2.5
                text-sm font-medium text-zinc-700 shadow-sm
                transition-all duration-200 ease-out
                hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900
                focus:outline-none focus:ring-2 focus:ring-zinc-300
              "
            >
              <ExternalLink className="h-4 w-4" />
              Open receipt image
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

