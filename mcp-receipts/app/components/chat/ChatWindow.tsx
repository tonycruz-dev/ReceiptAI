import { RefObject } from "react";
import { ChatMessage } from "@/lib/types";
import { ChatMessageItem } from "./ChatMessageItem";
import { MessageSquareText } from "lucide-react";
import ReceiptList from "../receipts/ReceiptList";

type ChatWindowProps = {
  messages: ChatMessage[];
  sending: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export default function ChatWindow({
  messages,
  sending,
  messagesEndRef,
}: ChatWindowProps) {
  const lastMessage = messages[messages.length - 1];
  const likelyReceiptQuery =
    sending &&
    lastMessage?.role === "user" &&
    lastMessage.content.toLowerCase().includes("receipt");

  return (
    <section className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Receipt chat
              </h2>
              <p className="mt-0.5 text-sm text-zinc-600">
                Ask questions, run MCP tools, and review receipt results.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto bg-zinc-50 p-4 sm:p-6">
        {messages.map((message, index) => (
          <ChatMessageItem key={`${message.role}-${index}`} message={message} />
        ))}

        {sending ? (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-300" />
                <span>Thinking…</span>
              </div>
            </div>
          </div>
        ) : null}

        {likelyReceiptQuery ? <ReceiptList loading /> : null}

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
