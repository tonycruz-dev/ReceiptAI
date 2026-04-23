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
      className={`w-full rounded-2xl border p-3 text-left transition ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white hover:bg-zinc-50"
      }`}
    >
      <div className="text-sm font-medium">{title}</div>
      {description ? (
        <div
          className={`mt-1 line-clamp-2 text-xs ${
            selected ? "text-zinc-300" : "text-zinc-600"
          }`}
        >
          {description}
        </div>
      ) : null}
    </button>
  );
}
