import type { LucideIcon } from "lucide-react";

type QuickActionPillProps = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
};

export default function QuickActionPill({
  label,
  onClick,
  icon: Icon,
}: QuickActionPillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:border-zinc-300"
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-500" />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
