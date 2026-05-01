// This file defines the ReceiptsProvider component, which uses 
// React's Context API to manage the state of receipts in the ReceiptAI mobile application.
// The provider maintains the list of receipts, the selected receipt, loading states, and error handling. 
// It provides functions to fetch all receipts, fetch a receipt by ID, create a new receipt, and delete a receipt. 
// The provider uses useState to manage local state and useCallback to memoize the functions that interact with the API. 
// The context value is memoized using useMemo to optimize performance and prevent unnecessary re-renders of consuming components.

import React, { useCallback, useMemo, useState, type ReactNode } from "react";
import { ReceiptFilter, ReceiptsContext } from "./ReceiptsContext";
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
  getReceiptCategories,
} from "@/lib/api";
import type { CreateReceiptRequest, ReceiptDto } from "@/types/receipt";

// The ReceiptsProvider component provides the context value for managing receipts in the application.
// It maintains the state of receipts, the selected receipt, loading states, and error handling.
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
  const [categories, setCategories] = useState<string[]>([]);

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

        if (filter === "date-range" && fromDate && toDate) {
          const data = await getReceiptsByDateRange(fromDate, toDate);
          setReceipts(data);
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

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getReceiptCategories();
      setCategories(data);
    } catch {
      // optional: set error or ignore silently
    }
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
      categories,
      setCategories,

      selectedDate,
      setSelectedDate,

      fetchReceipts,
      fetchReceiptById,
      createReceipt: handleCreateReceipt,
      deleteReceipt: handleDeleteReceipt,
      clearSelectedReceipt,
      setSelectedReceipt,
      fetchCategories,
    }),
    [
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
      categories,
      setCategories,
      selectedDate,
      setSelectedDate,

      fetchReceipts,
      fetchReceiptById,
      handleCreateReceipt,
      handleDeleteReceipt,
      clearSelectedReceipt,
      fetchCategories,
    ],
  );

  return (
    <ReceiptsContext.Provider value={value}>
      {children}
    </ReceiptsContext.Provider>
  );
}
