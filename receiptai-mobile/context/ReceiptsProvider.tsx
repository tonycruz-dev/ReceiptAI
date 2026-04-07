// This file defines the ReceiptsProvider component, which uses 
// React's Context API to manage the state of receipts in the ReceiptAI mobile application.
// The provider maintains the list of receipts, the selected receipt, loading states, and error handling. 
// It provides functions to fetch all receipts, fetch a receipt by ID, create a new receipt, and delete a receipt. 
// The provider uses useState to manage local state and useCallback to memoize the functions that interact with the API. 
// The context value is memoized using useMemo to optimize performance and prevent unnecessary re-renders of consuming components.

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ReceiptsContext } from "./ReceiptsContext";
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
} from "@/lib/api";
import type { CreateReceiptRequest, ReceiptDto } from "@/types/receipt";

// The ReceiptsProvider component provides the context value for managing receipts in the application.
// It maintains the state of receipts, the selected receipt, loading states, and error handling.
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

  // Fetch a single receipt by ID and set it as the selected receipt.
  // This function is memoized using useCallback to prevent unnecessary re-renders of consuming components.
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

  // Create a new receipt using the provided input and update the state with the new receipt.
  // This function is memoized using useCallback to prevent unnecessary re-renders of consuming components.
  const handleCreateReceipt = useCallback(
    async (input: CreateReceiptRequest) => {
      setError("");

      const id = await createReceipt(input);
      const newReceipt = await getReceiptById(id);

      setReceipts((prev) => [newReceipt, ...prev]);
      setSelectedReceipt(newReceipt);

      return id;
    },
    []
  );

  // Delete a receipt by ID and update the state to remove the deleted receipt.
  // If the deleted receipt is currently selected, clear the selected receipt.
  // This function is memoized using useCallback to prevent unnecessary re-renders of consuming components.
  const handleDeleteReceipt = useCallback(async (id: string) => {
    setError("");

    await deleteReceipt(id);
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    setSelectedReceipt((prev) => (prev?.id === id ? null : prev));
  }, []);

  // Clear the selected receipt by setting it to null.
  // This function is memoized using useCallback to prevent unnecessary re-renders of consuming components.
  const clearSelectedReceipt = useCallback(() => {
    setSelectedReceipt(null);
  }, []);

  // Memoize the context value to optimize performance and prevent unnecessary re-renders of consuming components.
  // The context value includes the list of receipts, the selected receipt, loading and error states, 
  // and functions for fetching, creating, and deleting receipts.
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
