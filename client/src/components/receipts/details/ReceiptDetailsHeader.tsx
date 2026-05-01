import { Link } from "react-router-dom";

type ReceiptDetailsHeaderProps = {
  merchantName: string;
  purchaseDate: string;
  total: string;
  onDelete: () => void;
};

export default function ReceiptDetailsHeader({
  merchantName,
  purchaseDate,
  total,
  onDelete,
}: ReceiptDetailsHeaderProps) {
  return (
    <>
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to receipts
        </Link>
      </div>

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Receipt details
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {merchantName}
          </h1>

          <p className="mt-3 text-base text-slate-600">
            Purchased on {purchaseDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDelete}
            type="button"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Delete
          </button>

          <div className="rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              Total amount
            </p>
            <p className="mt-1 text-2xl font-bold">{total}</p>
          </div>
        </div>
      </div>
    </>
  );
}
