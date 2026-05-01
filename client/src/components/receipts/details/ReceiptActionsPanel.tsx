import { Link } from "react-router-dom";

type ReceiptActionsPanelProps = {
  imageUrl?: string | null;
};

export default function ReceiptActionsPanel({
  imageUrl,
}: ReceiptActionsPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to receipts
        </Link>

        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View original image
          </a>
        )}
      </div>
    </div>
  );
}
