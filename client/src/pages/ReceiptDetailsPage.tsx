import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useReceipts } from "../context/useReceipts";

export default function ReceiptDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedReceipt: receipt,
    loading,
    error,
    fetchReceiptById,
    deleteReceipt,
    clearSelectedReceipt,
  } = useReceipts();

  useEffect(() => {
    if (!id) return;

    fetchReceiptById(id);

    return () => {
      clearSelectedReceipt();
    };
  }, [id, fetchReceiptById, clearSelectedReceipt]);

  async function handleDelete() {
    if (!receipt) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this receipt?"
    );

    if (!confirmed) return;

    try {
      await deleteReceipt(receipt.id);
      navigate("/", { replace: true });
    } catch {
      alert("Failed to delete receipt.");
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading receipt...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-red-700">
              Something went wrong
            </h1>
            <p className="mt-2 text-red-600">{error}</p>
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

  if (!receipt) {
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

  const formattedPurchaseDate = new Date(
    receipt.purchaseDate
  ).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedCreatedAt = new Date(receipt.createdAt).toLocaleString();

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
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
              {receipt.merchantName}
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Purchased on {formattedPurchaseDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              type="button"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Delete
            </button>

            <div className="rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                Total amount
              </p>
              <p className="mt-1 text-2xl font-bold">
                {receipt.currency} {receipt.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Receipt image
              </h2>
              {receipt.imageUrl && (
                <a
                  href={receipt.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Open full image
                </a>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {receipt.imageUrl ? (
                <img
                  src={receipt.imageUrl}
                  alt={receipt.merchantName}
                  className="max-h-180 w-full object-contain"
                />
              ) : (
                <div className="flex min-h-105 items-center justify-center px-6 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <span className="text-3xl">🧾</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      No image available
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      This receipt does not have an uploaded preview image.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

              <div className="mt-6 space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Merchant
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {receipt.merchantName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Purchase date
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formattedPurchaseDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Category
                    </p>
                    <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {receipt.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Created
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {formattedCreatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Amount</h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Total paid</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {receipt.currency} {receipt.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick actions
              </h2>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Back to receipts
                </Link>

                {receipt.imageUrl && (
                  <a
                    href={receipt.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    View original image
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
