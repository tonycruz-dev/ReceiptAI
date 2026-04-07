//
// This file defines the ReceiptsContext, which provides a 
// centralized state management solution for handling receipts in the ReceiptAI mobile application. 
// It includes types for the context value and initializes the context with default values. 
// The context will be used to manage the list of receipts, the selected receipt, loading states, 
// and error handling across the application.
// The ReceiptsContextType defines the shape of the context value, including properties for the list of receipts, 
// the selected receipt, loading and error states, and functions for fetching, creating, and deleting receipts. 
// The context is created using React's createContext function and is initialized with an undefined value, 
// which will be provided by a corresponding provider component elsewhere in the application.


import { createContext } from "react";
import type { CreateReceiptRequest , ReceiptDto } from "../types/receipt";


// Define the shape of the context value
// This type includes the list of receipts, the selected receipt, 
// loading and error states, and functions for fetching, creating, and deleting receipts.
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

// Create the context with an undefined default value.
// The context will be provided by a corresponding provider component elsewhere in the application.
// The context is initialized with an undefined value, which will be provided by a corresponding provider 
// component elsewhere in the application.
export const ReceiptsContext = createContext<ReceiptsContextType | undefined>(
  undefined
);
