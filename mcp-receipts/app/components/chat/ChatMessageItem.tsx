import ChatMessageBubble from "./ChatMessage";
import EmptyState from "../EmptyState";
import ReceiptCard from "../ReceiptCard";
import ReceiptGrid from "../ReceiptGrid";
import type { ChatMessage } from "@/lib/types";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const receipts = message.role === "assistant" ? message.toolData?.receipts : undefined;

  return (
    <div className="space-y-3">
      {receipts ? (
        receipts.length === 0 ? (
          <EmptyState
            title="No receipts"
            subtitle="Try a different query, date range, or category."
          />
        ) : receipts.length === 1 ? (
          <ReceiptCard receipt={receipts[0]} />
        ) : (
          <ReceiptGrid receipts={receipts} />
        )
      ) : (
        <ChatMessageBubble message={message} />
      )}
    </div>
  );
}