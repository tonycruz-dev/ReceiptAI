import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ReceiptsContext, type ReceiptFilter } from "./ReceiptsContext";
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
  getRecentReceipts,
  getReceiptsByCategory,
  getReceiptsByDateRange,
  getReceiptsByDate,
  getThisMonthReceipts,
} from "../api/receipts";
import type { ReceiptDto } from "../types/receipt";

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filter, setFilter] = useState<ReceiptFilter>("all");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (filter === "recent") {
        const data = await getRecentReceipts(10);
        setReceipts(data);
        return;
      }

      if (filter === "category" && category) {
        const data = await getReceiptsByCategory(category);
        setReceipts(data);
        return;
      }

      if (filter === "date-range") {
        if (!fromDate || !toDate) {
          setReceipts([]);
          setTotalPages(1);
          setHasNextPage(false);
          return;
        }

        const data = await getReceiptsByDateRange(fromDate, toDate);
        setReceipts(data);
        setTotalPages(1);
        setHasNextPage(false);
        return;
      }

      if (filter === "by-date" && selectedDate) {
        const data = await getReceiptsByDate(selectedDate);
        setReceipts(data);
        return;
      }

      if (filter === "this-month") {
        const data = await getThisMonthReceipts();
        setReceipts(data);
        return;
      }

      const data = await getReceipts(page, 10);
      setReceipts(data.items);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
    } catch {
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, [filter, category, fromDate, toDate, selectedDate, page]);

  const fetchReceiptById = useCallback(async (id: string) => {
    setLoading(true);
    setError("");

    try {
      const data = await getReceiptById(id);
      setSelectedReceipt(data);
      return data;
    } catch {
      setError("Failed to load receipt");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateReceipt = useCallback(async (input: any) => {
    setError("");

    const id = await createReceipt(input);
    const newReceipt = await getReceiptById(id);

    setReceipts((prev) => [newReceipt, ...prev]);
    setSelectedReceipt(newReceipt);

    return id;
  }, []);

  const handleDeleteReceipt = useCallback(async (id: string) => {
    setError("");

    await deleteReceipt(id);
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    setSelectedReceipt((prev) => (prev?.id === id ? null : prev));
  }, []);
  

  const clearSelectedReceipt = useCallback(() => {
    setSelectedReceipt(null);
  }, []);

  const value = useMemo(
    () => ({
      receipts,
      selectedReceipt,
      loading,
      error,

      // pagination
      page,
      setPage,
      totalPages,
      hasNextPage,

      // filters 👇
      filter,
      setFilter,
      category,
      setCategory,
      fromDate,
      setFromDate,
      toDate,
      setToDate,
      selectedDate,
      setSelectedDate,

      fetchReceipts,
      fetchReceiptById,
      createReceipt: handleCreateReceipt,
      deleteReceipt: handleDeleteReceipt,
      clearSelectedReceipt,
      setSelectedReceipt,
    }),
    [
      receipts,
      selectedReceipt,
      loading,
      error,
      page,
      totalPages,
      hasNextPage,

      filter,
      category,
      fromDate,
      toDate,
      selectedDate,

      fetchReceipts,
      fetchReceiptById,
      handleCreateReceipt,
      handleDeleteReceipt,
      clearSelectedReceipt,
    ],
  );

  return (
    <ReceiptsContext.Provider value={value}>
      {children}
    </ReceiptsContext.Provider>
  );
}
