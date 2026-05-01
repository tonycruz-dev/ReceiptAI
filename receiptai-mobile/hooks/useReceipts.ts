// The useReceipts hook provides a convenient way for components to access the ReceiptsContext.
// It uses the useContext hook to access the context value and includes error handling to ensure that it is used within a corresponding provider component.
// If the context value is undefined, an error is thrown to indicate that the hook must be used within a ReceiptsProvider.
// This hook simplifies the process of consuming the context in components and ensures that they have access to the necessary state and functions for managing receipts.
import { useContext } from "react";
import { ReceiptsContext } from "../context/ReceiptsContext";

export function useReceipts() {
  const context = useContext(ReceiptsContext);

  if (!context) {
    throw new Error("useReceipts must be used within ReceiptsProvider");
  }

  return context;
}
