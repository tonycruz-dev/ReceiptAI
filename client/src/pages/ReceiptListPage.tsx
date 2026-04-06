import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReceipts } from "../context/useReceipts";

export default function ReceiptListPage() {
  const [pageError, setPageError] = useState("");

  const { receipts, loading, error, fetchReceipts } = useReceipts();

  useEffect(() => {
    async function loadReceipts() {
      try {
        setPageError("");
        await fetchReceipts();
      } catch {
        setPageError("Failed to load receipts.");
      }
    }

    loadReceipts();
  }, [fetchReceipts]);

  const totalSpent = receipts.reduce(
    (sum, receipt) => sum + receipt.totalAmount,
    0
  );

  const currency = receipts.length > 0 ? receipts[0].currency : "GBP";
  const displayError = pageError || error;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading receipts...
          </p>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 shadow-sm">
          <p className="text-sm font-medium text-red-600">{displayError}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Dashboard
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Receipts
            </h1>

            <p className="mt-3 max-w-2xl text-base text-slate-600">
              View, manage, and organize your uploaded receipts in one place.
            </p>

            <div className="mt-5 inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total spent
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency,
                  }).format(totalSpent)}
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Receipts
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {receipts.length}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Upload Receipt
          </Link>
        </div>

        {receipts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No receipts yet
            </h2>
            <p className="mt-2 text-slate-600">
              Start by uploading your first receipt.
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Upload your first receipt
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {receipts.map((receipt) => (
              <Link
                key={receipt.id}
                to={`/receipts/${receipt.id}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  {receipt.imageUrl ? (
                    <img
                      src={receipt.imageUrl}
                      alt={receipt.merchantName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                      No image available
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        {receipt.merchantName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(receipt.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {receipt.category}
                    </span>
                  </div>

                  <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: receipt.currency,
                        }).format(receipt.totalAmount)}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-slate-700 transition group-hover:text-slate-900">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
