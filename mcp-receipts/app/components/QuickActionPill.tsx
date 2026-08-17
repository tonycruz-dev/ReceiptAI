import type { LucideIcon } from "lucide-react";

type QuickActionPillProps = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
};

export default function QuickActionPill({
  label,
  onClick,
  icon: Icon,
  disabled,
}: QuickActionPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:pointer-events-none disabled:opacity-50"
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
