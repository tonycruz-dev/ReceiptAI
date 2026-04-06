import { createContext } from "react";
import type { CreateReceiptRequest, ReceiptDto } from "../types/receipt";

export type ReceiptsContextType = {
  receipts: ReceiptDto[];
  selectedReceipt: ReceiptDto | null;
  loading: boolean;
  error: string;
  fetchReceipts: () => Promise<void>;
  fetchReceiptById: (id: string) => Promise<ReceiptDto | null>;
   
  createReceipt: (input: CreateReceiptRequest) => Promise<string>;
  deleteReceipt: (id: string) => Promise<void>;
  clearSelectedReceipt: () => void;
  setSelectedReceipt: (receipt: ReceiptDto | null) => void;
};

export const ReceiptsContext = createContext<ReceiptsContextType | undefined>(
  undefined
);
