import { Link } from "react-router-dom";

type ReceiptDetailsErrorProps = {
  errorMessage: string;
};

export default function ReceiptDetailsError({
  errorMessage,
}: ReceiptDetailsErrorProps) {
  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-red-700">
            Something went wrong
          </h1>

          <p className="mt-2 text-red-600">{errorMessage}</p>

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
