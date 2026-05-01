type ReceiptAmountPanelProps = {
  total: string;
};

export default function ReceiptAmountPanel({ total }: ReceiptAmountPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Amount</h2>

      <div className="mt-5 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-500">Total paid</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {total}
        </p>
      </div>
    </div>
  );
}
