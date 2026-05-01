import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReceiptImage, extractReceiptData } from "../api/receipts";
import { useReceipts } from "../context/useReceipts";

import UploadPageHeader from "../components/receipts/upload/UploadPageHeader";
import ReceiptFileSelector from "../components/receipts/upload/ReceiptFileSelector";
import UploadMessage from "../components/receipts/upload/UploadMessage";
import ReceiptReviewForm from "../components/receipts/upload/ReceiptReviewForm";
import ReceiptPreviewPanel from "../components/receipts/upload/ReceiptPreviewPanel";

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
    "info",
  );
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  function showMessage(
    text: string,
    type: "success" | "error" | "info" = "info",
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
          "error",
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
        extraction.purchaseDate ? extraction.purchaseDate.slice(0, 10) : "",
      );
      setTotalAmount(
        extraction.totalAmount !== null && extraction.totalAmount !== undefined
          ? String(extraction.totalAmount)
          : "",
      );
      setCurrency(extraction.currency || "GBP");
      setCategory(extraction.category || "Other");

      showMessage(
        "Receipt uploaded and extracted successfully. Review the details before saving.",
        "success",
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

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <UploadPageHeader />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ReceiptFileSelector
              file={file}
              fileInputRef={fileInputRef}
              extracting={extracting}
              saving={saving}
              onFileChange={resetExtractedData}
              onUploadAndExtract={handleUploadAndExtract}
            />

            <UploadMessage message={message} messageType={messageType} />

            <ReceiptReviewForm
              merchantName={merchantName}
              purchaseDate={purchaseDate}
              totalAmount={totalAmount}
              currency={currency}
              category={category}
              saving={saving}
              extracting={extracting}
              canSave={Boolean(imageUrl && imagePublicId)}
              onMerchantNameChange={setMerchantName}
              onPurchaseDateChange={setPurchaseDate}
              onTotalAmountChange={setTotalAmount}
              onCurrencyChange={setCurrency}
              onCategoryChange={setCategory}
              onSave={handleSave}
            />
          </div>

          <ReceiptPreviewPanel imageUrl={imageUrl} />
        </div>
      </div>
    </section>
  );
}
