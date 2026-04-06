import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReceiptImage, extractReceiptData } from "../api/receipts";
import { useReceipts } from "../context/useReceipts";

export default function UploadReceiptPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { createReceipt } = useReceipts();

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [category, setCategory] = useState("Other");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  function showMessage(
    text: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setMessage(text);
    setMessageType(type);
  }

  function resetExtractedData(nextFile: File | null) {
    setFile(nextFile);
    setImageUrl("");
    setImagePublicId("");
    setMerchantName("");
    setPurchaseDate("");
    setTotalAmount("");
    setCurrency("GBP");
    setCategory("Other");
    setMessage("");
    setMessageType("info");
  }

  async function handleUploadAndExtract() {
    if (!file) {
      showMessage("Please select a receipt image first.", "error");
      return;
    }

    setExtracting(true);
    setMessage("");

    try {
      const uploadResult = await uploadReceiptImage(file);
      if (!uploadResult.url || !uploadResult.publicId) {
        showMessage(
          uploadResult.errorMessage || "Image upload failed.",
          "error"
        );
        return;
      }

      setImageUrl(uploadResult.url);
      setImagePublicId(uploadResult.publicId);

      const extraction = await extractReceiptData({
        imageUrl: uploadResult.url,
      });

      if (extraction.errorMessage) {
        showMessage(extraction.errorMessage, "error");
        return;
      }

      setMerchantName(extraction.merchantName || "");
      setPurchaseDate(
        extraction.purchaseDate ? extraction.purchaseDate.slice(0, 10) : ""
      );
      setTotalAmount(
        extraction.totalAmount !== null && extraction.totalAmount !== undefined
          ? String(extraction.totalAmount)
          : ""
      );
      setCurrency(extraction.currency || "GBP");
      setCategory(extraction.category || "Other");

      showMessage(
        "Receipt uploaded and extracted successfully. Review the details before saving.",
        "success"
      );
    } catch {
      showMessage("Failed to upload and extract receipt.", "error");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    if (!imageUrl || !imagePublicId) {
      showMessage("Upload an image before saving.", "error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const id = await createReceipt({
        merchantName,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate).toISOString()
          : new Date().toISOString(),
        totalAmount: Number(totalAmount),
        currency,
        category,
        imageUrl,
        imagePublicId,
      });

      navigate(`/receipts/${id}`);
    } catch {
      showMessage("Failed to save receipt.", "error");
    } finally {
      setSaving(false);
    }
  }

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Receipt Management
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Upload Receipt
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Upload a receipt image, extract the details automatically, then
            review and save it to your records.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                1. Select your receipt
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Supported format: image files only.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => resetExtractedData(e.target.files?.[0] || null)}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-slate-400 hover:bg-slate-100"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <span className="text-2xl">📄</span>
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  Choose receipt image
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Click to browse and upload a receipt photo or scan
                </p>

                <div className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Select file
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {file ? file.name : "No file selected"}
                </p>
              </div>
            </div>

            <button
              onClick={handleUploadAndExtract}
              disabled={extracting || saving || !file}
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {extracting ? "Processing receipt..." : "Upload and extract"}
            </button>

            {message && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
              >
                {message}
              </div>
            )}

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                2. Review extracted details
              </h2>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Merchant name
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. Tesco"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Purchase date
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Total amount
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Currency
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="GBP"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Groceries"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || extracting || !imageUrl || !imagePublicId}
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                {saving ? "Saving..." : "Save receipt"}
              </button>
            </div>
          </div>

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
        </div>
      </div>
    </section>
  );
}