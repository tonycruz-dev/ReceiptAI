import { RefObject } from "react";
import { ChatMessage } from "@/lib/types";
import { ChatMessageItem } from "./ChatMessageItem";

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
  return (
    <section className="mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-lg font-semibold">Receipt chat</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Your messages, receipt cards, and MCP-assisted responses appear here.
        </p>
      </div>

      <div className="max-h-130 space-y-4 overflow-y-auto bg-zinc-50 p-4">
        {messages.map((message, index) => (
          <ChatMessageItem key={`${message.role}-${index}`} message={message} />
        ))}

        {sending ? (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
              Thinking...
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
