import { Link } from "react-router-dom";

export default function ReceiptEmptyState() {
  return (
    <div className="rounded-4xl border border-dashed border-slate-300/90 bg-white/80 p-8 text-center shadow-xl shadow-slate-200/70 backdrop-blur sm:p-14">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-slate-100 ring-1 ring-inset ring-slate-200">
        <div className="relative h-10 w-8 rounded-xl border-2 border-slate-400 bg-white shadow-sm">
          <div className="absolute left-1.5 right-1.5 top-2 h-1 rounded-full bg-slate-200" />
          <div className="absolute left-1.5 right-2 top-5 h-1 rounded-full bg-slate-200" />
          <div className="absolute bottom-2 left-1.5 h-1 w-3 rounded-full bg-slate-300" />
        </div>
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
        No receipts yet
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
        Start your collection with your first upload and keep every purchase
        easy to find later.
      </p>

      <Link
        to="/upload"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      >
        Upload your first receipt
      </Link>
    </div>
  );
}
