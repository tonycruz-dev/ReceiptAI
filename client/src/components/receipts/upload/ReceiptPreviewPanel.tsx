type ReceiptPreviewPanelProps = {
  imageUrl: string;
};

export default function ReceiptPreviewPanel({
  imageUrl,
}: ReceiptPreviewPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Receipt preview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your uploaded receipt image will appear here.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Receipt preview"
            className="h-full w-full object-contain"
          />
        ) : (
          <ReceiptPreviewEmptyState />
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Tips for better extraction
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Use a clear, well-lit image</li>
          <li>Keep the full receipt visible in frame</li>
          <li>Avoid blur, glare, or shadows</li>
        </ul>
      </div>
    </div>
  );
}

function ReceiptPreviewEmptyState() {
  return (
    <div className="flex min-h-105 items-center justify-center px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <span className="text-3xl">🧾</span>
        </div>

        <h3 className="text-base font-semibold text-slate-900">
          No preview yet
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Upload a receipt image to preview it here before saving.
        </p>
      </div>
    </div>
  );
}
