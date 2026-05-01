type ReceiptImagePanelProps = {
  imageUrl?: string | null;
  merchantName: string;
};

export default function ReceiptImagePanel({
  imageUrl,
  merchantName,
}: ReceiptImagePanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Receipt image</h2>

        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Open full image
          </a>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Receipt from ${merchantName}`}
            className="max-h-180 w-full object-contain"
          />
        ) : (
          <ReceiptImageEmptyState />
        )}
      </div>
    </div>
  );
}

function ReceiptImageEmptyState() {
  return (
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
  );
}
