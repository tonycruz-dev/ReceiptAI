import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReceipts } from "../context/useReceipts";

import ReceiptActionsPanel from "../components/receipts/details/ReceiptActionsPanel";
import ReceiptAmountPanel from "../components/receipts/details/ReceiptAmountPanel";
import ReceiptDetailsError from "../components/receipts/details/ReceiptDetailsError";
import ReceiptDetailsHeader from "../components/receipts/details/ReceiptDetailsHeader";
import ReceiptDetailsLoading from "../components/receipts/details/ReceiptDetailsLoading";
import ReceiptDetailsNotFound from "../components/receipts/details/ReceiptDetailsNotFound";
import ReceiptImagePanel from "../components/receipts/details/ReceiptImagePanel";
import ReceiptSummaryPanel from "../components/receipts/details/ReceiptSummaryPanel";
import {
  formatCurrency,
  formatDate,
  getSafeCategory,
  getSafeMerchantName,
} from "../utils/receiptFormatters";

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
      "Are you sure you want to delete this receipt?",
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
    return <ReceiptDetailsLoading />;
  }

  if (error) {
    return <ReceiptDetailsError errorMessage={error} />;
  }

  if (!receipt) {
    return <ReceiptDetailsNotFound />;
  }

  const merchantName = getSafeMerchantName(receipt.merchantName);
  const category = getSafeCategory(receipt.category);
  const purchaseDate = formatDate(receipt.purchaseDate);
  const createdAt = formatDate(receipt.createdAt);
  const total = formatCurrency(receipt.totalAmount, receipt.currency);

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <ReceiptDetailsHeader
          merchantName={merchantName}
          purchaseDate={purchaseDate}
          total={total}
          onDelete={handleDelete}
        />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <ReceiptImagePanel
            imageUrl={receipt.imageUrl}
            merchantName={merchantName}
          />

          <div className="space-y-6">
            <ReceiptSummaryPanel
              merchantName={merchantName}
              purchaseDate={purchaseDate}
              category={category}
              createdAt={createdAt}
            />

            <ReceiptAmountPanel total={total} />

            <ReceiptActionsPanel imageUrl={receipt.imageUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
