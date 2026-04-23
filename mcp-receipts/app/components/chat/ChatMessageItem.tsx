import { ChatMessage } from "@/lib/types";
import { ChatBubble } from "./ChatBubble";
import ReceiptGrid from "../ReceiptGrid";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const receiptCardsVisible = hasReceiptCards(message);
  const bubbleVisible = message.role === "user" || !receiptCardsVisible;

  return (
    <div className="space-y-3">
      {bubbleVisible ? <ChatBubble message={message} /> : null}

      {receiptCardsVisible ? (
        <ReceiptGrid receipts={message.toolData!.receipts!} />
      ) : null}
    </div>
  );
}

function hasReceiptCards(message: ChatMessage) {
  return message.role === "assistant" && !!message.toolData?.receipts?.length;
}