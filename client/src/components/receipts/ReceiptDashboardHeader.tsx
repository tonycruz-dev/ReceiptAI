import { Link } from "react-router-dom";

export default function ReceiptDashboardHeader() {
  return (
    <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Receipt dashboard
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Keep every receipt beautifully organised.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Review recent spending, browse uploaded receipts, and jump into the
          details without losing the clean overview.
        </p>
      </div>

      <Link
        to="/upload"
        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      >
        Upload Receipt
      </Link>
    </div>
  );
}
