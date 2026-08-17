type ActionMenuButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export default function ActionMenuButton({
  label,
  active,
  onClick,
  icon,
  children,
}: ActionMenuButtonProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:text-sm ${
          active
            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-zinc-200"
            : "text-zinc-600 hover:bg-white/80 hover:text-zinc-950"
        }`}
      >
        {icon}
        {label}
        <ChevronUp
          className={`h-3.5 w-3.5 transition-transform ${active ? "rotate-0" : "rotate-180"}`}
          aria-hidden="true"
        />
      </button>

      {active ? (
        <div className="absolute bottom-full left-0 z-30 mb-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
import { ChevronUp } from "lucide-react";
