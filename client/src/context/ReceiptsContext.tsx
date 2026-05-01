import { createContext } from "react";
import type { CreateReceiptRequest, ReceiptDto } from "../types/receipt";

export type ReceiptFilter =
  | "all"
  | "recent"
  | "category"
  | "date-range"
  | "by-date"
  | "this-month";
export type ReceiptsContextType = {
  receipts: ReceiptDto[];
  selectedReceipt: ReceiptDto | null;
  loading: boolean;
  error: string;

  // pagination 👇
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  hasNextPage: boolean;

  fetchReceipts: () => Promise<void>;
  fetchReceiptById: (id: string) => Promise<ReceiptDto | null>;

  createReceipt: (input: CreateReceiptRequest) => Promise<string>;
  deleteReceipt: (id: string) => Promise<void>;
  clearSelectedReceipt: () => void;
  setSelectedReceipt: (receipt: ReceiptDto | null) => void;

  // filters 👇
  filter: ReceiptFilter;
  setFilter: React.Dispatch<React.SetStateAction<ReceiptFilter>>;

  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;

  fromDate: string;
  setFromDate: React.Dispatch<React.SetStateAction<string>>;

  toDate: string;
  setToDate: React.Dispatch<React.SetStateAction<string>>;

  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
};

export const ReceiptsContext = createContext<ReceiptsContextType | undefined>(
  undefined
);
