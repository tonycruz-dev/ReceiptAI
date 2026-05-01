type ReceiptReviewFormProps = {
  merchantName: string;
  purchaseDate: string;
  totalAmount: string;
  currency: string;
  category: string;
  saving: boolean;
  extracting: boolean;
  canSave: boolean;
  onMerchantNameChange: (value: string) => void;
  onPurchaseDateChange: (value: string) => void;
  onTotalAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSave: () => void;
};

export default function ReceiptReviewForm({
  merchantName,
  purchaseDate,
  totalAmount,
  currency,
  category,
  saving,
  extracting,
  canSave,
  onMerchantNameChange,
  onPurchaseDateChange,
  onTotalAmountChange,
  onCurrencyChange,
  onCategoryChange,
  onSave,
}: ReceiptReviewFormProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        2. Review extracted details
      </h2>

      <div className="grid gap-4">
        <FormField label="Merchant name">
          <input
            className={inputClassName}
            placeholder="e.g. Tesco"
            value={merchantName}
            onChange={(event) => onMerchantNameChange(event.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Purchase date">
            <input
              className={inputClassName}
              type="date"
              value={purchaseDate}
              onChange={(event) => onPurchaseDateChange(event.target.value)}
            />
          </FormField>

          <FormField label="Total amount">
            <input
              className={inputClassName}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={totalAmount}
              onChange={(event) => onTotalAmountChange(event.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Currency">
            <input
              className={inputClassName}
              placeholder="GBP"
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value)}
            />
          </FormField>

          <FormField label="Category">
            <input
              className={inputClassName}
              placeholder="Groceries"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
            />
          </FormField>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving || extracting || !canSave}
        type="button"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        {saving ? "Saving..." : "Save receipt"}
      </button>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
