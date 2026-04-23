import { QuickActionType } from "@/lib/types";

type DialogRendererProps = {
  activeDialog: QuickActionType | null;
  closeDialog: () => void;
  submitDialogAction: () => void;
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  categoryInput: string;
  setCategoryInput: (value: string) => void;
  receiptIdInput: string;
  setReceiptIdInput: (value: string) => void;
  recentCountInput: string;
  setRecentCountInput: (value: string) => void;
  topCountInput: string;
  setTopCountInput: (value: string) => void;
  singleDate: string;
  setSingleDate: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
};

export default function DialogRenderer({
  activeDialog,
  closeDialog,
  submitDialogAction,
  selectedImage,
  setSelectedImage,
  categoryInput,
  setCategoryInput,
  receiptIdInput,
  setReceiptIdInput,
  recentCountInput,
  setRecentCountInput,
  topCountInput,
  setTopCountInput,
  singleDate,
  setSingleDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: DialogRendererProps) {
  if (!activeDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900">
          {activeDialog === "create-receipt-from-image" &&
            "Upload receipt image"}
          {activeDialog === "receipts-by-category" && "Enter category"}
          {activeDialog === "receipts-by-id" && "Enter receipt ID"}
          {activeDialog === "recent-count" && "Enter recent receipt count"}
          {activeDialog === "top-10-resource" && "Top resources"}
          {activeDialog === "receipts-by-date-range" && "Select date range"}
          {activeDialog === "receipts-by-date" && "Select a date"}
        </h3>

        <div className="mt-4 space-y-4">
          {activeDialog === "create-receipt-from-image" && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2"
              />
              {selectedImage ? (
                <p className="text-sm text-zinc-600">{selectedImage.name}</p>
              ) : null}
            </div>
          )}

          {activeDialog === "receipts-by-category" && (
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="e.g. shopping"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
            />
          )}

          {activeDialog === "receipts-by-id" && (
            <input
              type="text"
              value={receiptIdInput}
              onChange={(e) => setReceiptIdInput(e.target.value)}
              placeholder="Receipt ID"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
            />
          )}

          {activeDialog === "recent-count" && (
            <input
              type="number"
              min="1"
              value={recentCountInput}
              onChange={(e) => setRecentCountInput(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
            />
          )}

          {activeDialog === "top-10-resource" && (
            <input
              type="number"
              min="1"
              value={topCountInput}
              onChange={(e) => setTopCountInput(e.target.value)}
              placeholder="10"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
            />
          )}

          {activeDialog === "receipts-by-date" && (
            <div className="space-y-1">
              <label className="text-sm text-zinc-600">Date</label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
              />
            </div>
          )}

          {activeDialog === "receipts-by-date-range" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-zinc-600">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-zinc-600">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeDialog}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={submitDialogAction}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
