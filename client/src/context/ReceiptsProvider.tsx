import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ReceiptsContext } from "./ReceiptsContext";
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
} from "../api/receipts";
import type { ReceiptDto } from "../types/receipt";

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDto | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch {
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchReceipts,
      fetchReceiptById,
      handleCreateReceipt,
      handleDeleteReceipt,
      clearSelectedReceipt,
    ]
  );

  return (
    <ReceiptsContext.Provider value={value}>
      {children}
    </ReceiptsContext.Provider>
  );
}
