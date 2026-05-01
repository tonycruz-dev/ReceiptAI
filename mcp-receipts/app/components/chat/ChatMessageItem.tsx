import ChatMessageBubble from "./ChatMessage";
import ReceiptList from "../receipts/ReceiptList";
import type { ChatMessage } from "@/lib/types";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const hasReceipts =
    message.role === "assistant" && Boolean(message.toolData?.receipts?.length);

  return (
    <div className="space-y-3">
      {hasReceipts ? (
        <ReceiptList receipts={message.toolData!.receipts} />
      ) : (
        <ChatMessageBubble message={message} />
      )}
    </div>
  );
}