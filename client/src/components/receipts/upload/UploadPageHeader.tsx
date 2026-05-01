export default function UploadPageHeader() {
  return (
    <div className="mb-10">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Receipt Management
      </p>

      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Upload Receipt
      </h1>

      <p className="mt-3 max-w-2xl text-base text-slate-600">
        Upload a receipt image, extract the details automatically, then review
        and save it to your records.
      </p>
    </div>
  );
}
