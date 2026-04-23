import EmptyState from "@/app/components/EmptyState";

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
    <div className="w-85 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
      <div className="border-b border-zinc-200 p-4">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="mt-3 w-full rounded-2xl border border-zinc-300 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
        />
      </div>

      <div className="max-h-90 space-y-2 overflow-y-auto p-3">
        {loading ? (
          <EmptyState title="Loading..." />
        ) : error ? (
          <EmptyState title="Could not load catalog" subtitle={error} />
        ) : childCount ? (
          children
        ) : (
          <EmptyState title={emptyTitle} />
        )}
      </div>
    </div>
  );
}
