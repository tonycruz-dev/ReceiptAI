type ReceiptSummaryPanelProps = {
  merchantName: string;
  purchaseDate: string;
  category: string;
  createdAt: string;
};

export default function ReceiptSummaryPanel({
  merchantName,
  purchaseDate,
  category,
  createdAt,
}: ReceiptSummaryPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

      <div className="mt-6 space-y-5">
        <SummaryRow label="Merchant" value={merchantName} />
        <SummaryRow label="Purchase date" value={purchaseDate} />

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Category</p>
            <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {category}
            </div>
          </div>
        </div>

        <SummaryRow label="Created" value={createdAt} hasBorder={false} />
      </div>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  hasBorder?: boolean;
};

function SummaryRow({ label, value, hasBorder = true }: SummaryRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${
        hasBorder ? "border-b border-slate-100 pb-4" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
