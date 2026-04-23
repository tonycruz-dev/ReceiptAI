import { ReceiptCardData } from "@/lib/types";
import ReceiptCard from "./ReceiptCard";

type ReceiptGridProps = {
  receipts: ReceiptCardData[];
};

export default function ReceiptGrid({ receipts }: ReceiptGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 pl-0 md:grid-cols-2">
      {receipts.map((receipt) => (
        <ReceiptCard key={receipt.id || receipt.shortId} receipt={receipt} />
      ))}
    </div>
  );
}
