type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex min-h-30 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
      <div>
        <div className="text-sm font-medium text-zinc-800">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-zinc-500">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
