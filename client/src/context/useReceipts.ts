import { useContext } from "react";
import { ReceiptsContext } from "./ReceiptsContext";

export function useReceipts() {
  const context = useContext(ReceiptsContext);

  if (!context) {
    throw new Error("useReceipts must be used within ReceiptsProvider");
  }

  return context;
}
