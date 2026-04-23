type InfoPillProps = {
  label: string;
  value: string;
};

export default function InfoPill({ label, value }: InfoPillProps) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-medium text-zinc-900">{value}</div>
    </div>
  );
}
