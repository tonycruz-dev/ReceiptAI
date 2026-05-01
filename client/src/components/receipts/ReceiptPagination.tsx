type ReceiptPaginationProps = {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
};

export default function ReceiptPagination({
  page,
  totalPages,
  hasNextPage,
  onPageChange,
}: ReceiptPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange((current) => Math.max(1, current - 1))}
        className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() =>
          onPageChange((current) => Math.min(totalPages, current + 1))
        }
        className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
