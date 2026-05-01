import type { RefObject } from "react";

type ReceiptFileSelectorProps = {
  file: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  extracting: boolean;
  saving: boolean;
  onFileChange: (file: File | null) => void;
  onUploadAndExtract: () => void;
};

export default function ReceiptFileSelector({
  file,
  fileInputRef,
  extracting,
  saving,
  onFileChange,
  onUploadAndExtract,
}: ReceiptFileSelectorProps) {
  return (
    <>
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
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
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
        onClick={onUploadAndExtract}
        disabled={extracting || saving || !file}
        type="button"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {extracting ? "Processing receipt..." : "Upload and extract"}
      </button>
    </>
  );
}
