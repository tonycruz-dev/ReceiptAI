import EmptyState from "@/app/components/EmptyState";
import { AlertCircle, Search } from "lucide-react";

type MenuPanelProps = {
  title: string;
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  children: React.ReactNode;
};

export default function MenuPanel({
  title,
  loading,
  error,
  emptyTitle,
  search,
  onSearchChange,
  searchPlaceholder,
  children,
}: MenuPanelProps) {
  const childCount = Array.isArray(children)
    ? children.length
    : children
      ? 1
      : 0;

  return (
    <div className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_24px_70px_-20px_rgba(24,24,27,0.4)] ring-1 ring-white">
      <div className="border-b border-zinc-100 p-4">
        <div className="text-sm font-semibold text-zinc-950">{title}</div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100/70"
          />
        </div>
      </div>

      <div className="max-h-80 space-y-1.5 overflow-y-auto bg-zinc-50/60 p-2">
        {loading ? (
          <EmptyState title="Loading..." />
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Could not load catalog</p>
              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>
          </div>
        ) : childCount ? (
          children
        ) : (
          <EmptyState title={emptyTitle} />
        )}
      </div>
    </div>
  );
}
