type MenuItemProps = {
  title: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
};

export default function MenuItem({
  title,
  description,
  selected,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`group w-full rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
        selected
          ? "border-indigo-200 bg-indigo-50 text-indigo-950 shadow-sm"
          : "border-transparent bg-white text-zinc-900 hover:border-zinc-200 hover:bg-zinc-50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        {selected ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {description ? (
        <div
          className={`mt-1 line-clamp-2 text-xs ${
            selected ? "text-indigo-700" : "text-zinc-500"
          }`}
        >
          {description}
        </div>
      ) : null}
    </button>
  );
}
import { Check } from "lucide-react";
