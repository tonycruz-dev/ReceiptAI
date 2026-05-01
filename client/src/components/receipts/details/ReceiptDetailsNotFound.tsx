import { Link } from "react-router-dom";

export default function ReceiptDetailsNotFound() {
  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Receipt not found
          </h1>

          <p className="mt-2 text-slate-600">
            The receipt you are looking for could not be found.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to receipts
          </Link>
        </div>
      </div>
    </section>
  );
}
