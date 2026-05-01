"use client";

import { useMemo, useState } from "react";
import { ReceiptCardData } from "@/lib/types";
import EmptyState from "../EmptyState";
import ReceiptRow, { ReceiptRowSkeleton } from "./ReceiptRow";

type ReceiptListProps = {
  receipts?: ReceiptCardData[];
  loading?: boolean;
};

export default function ReceiptList({
  receipts,
  loading = false,
}: ReceiptListProps) {
  const items = useMemo(() => receipts ?? [], [receipts]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="text-sm font-semibold text-zinc-900">Receipts</div>
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
          {loading
            ? "Loading"
            : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ReceiptRowSkeleton key={idx} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No receipts"
            subtitle="Try a different query, date range, or category."
          />
        </div>
      ) : (
        <div className="space-y-3 p-3">
          {items.map((receipt) => {
            const key = receipt.id || receipt.shortId;
            const expanded = expandedId === key;

            return (
              <ReceiptRow
                key={key}
                receipt={receipt}
                expanded={expanded}
                onToggle={() =>
                  setExpandedId((current) => (current === key ? null : key))
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
