import { formatCurrency } from "../../utils/receiptFormatters";

type ReceiptStatsProps = {
  totalSpent: number;
  primaryCurrency: string;
  receiptCount: number;
  latestReceiptDate: string;
};

export default function ReceiptStats({
  totalSpent,
  primaryCurrency,
  receiptCount,
  latestReceiptDate,
}: ReceiptStatsProps) {
  return (
    <div className="mb-10 grid gap-4 md:grid-cols-3 lg:mb-12">
      <StatCard
        label="Total spent"
        value={formatCurrency(totalSpent, primaryCurrency)}
        description="Across all uploaded receipts"
      />

      <StatCard
        label="Receipts"
        value={receiptCount}
        description="Items available in your dashboard"
      />

      <StatCard
        label="Latest receipt"
        value={latestReceiptDate}
        description="Most recent purchase date available"
      />
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
