import { Link } from "react-router-dom";
import PageBackground from "./PageBackground";
import { PAGE_SHELL_CLASS_NAME } from "../../utils/receiptFormatters";

type ReceiptErrorStateProps = {
  errorMessage: string;
  onRetry: () => void;
};

export default function ReceiptErrorState({
  errorMessage,
  onRetry,
}: ReceiptErrorStateProps) {
  return (
    <section className={PAGE_SHELL_CLASS_NAME}>
      <PageBackground />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-4xl border border-red-200/70 bg-white/90 p-8 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-current text-lg font-bold">
              !
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            We couldn&apos;t load your receipts
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            {errorMessage}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Try again
            </button>

            <Link
              to="/upload"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Upload receipt instead
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
