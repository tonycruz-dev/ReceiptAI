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
        onClick={onClick}
        className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
          active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        {icon}
        {label}
      </button>

      {active ? (
        <div className="absolute bottom-full left-0 z-30 mb-2.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
