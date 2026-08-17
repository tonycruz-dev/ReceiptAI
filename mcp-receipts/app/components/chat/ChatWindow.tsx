import { RefObject } from "react";
import { ChatMessage } from "@/lib/types";
import { ChatMessageItem } from "./ChatMessageItem";
import { MessageSquareText, ReceiptText, Sparkles } from "lucide-react";
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
  const visibleMessages = messages.slice(1);
  const isEmpty = visibleMessages.length === 0 && !sending;

  return (
    <section className="flex min-h-[34rem] w-full flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_20px_70px_-30px_rgba(24,24,27,0.35)] ring-1 ring-zinc-200/70 backdrop-blur-xl">
      <div className="border-b border-zinc-200/80 bg-white/80 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl">
                  Receipt Chat
                </h1>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  MCP workspace
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                Search, create, and review receipts with connected capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto bg-zinc-50/70 p-4 sm:p-6">
        {isEmpty ? (
          <div className="flex min-h-[22rem] items-center justify-center px-2 py-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm">
                <ReceiptText className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900">
                What would you like to know?
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Ask a question, choose a quick action, or browse an MCP tool,
                resource, or prompt below.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                Receipt intelligence, ready when you are
              </div>
            </div>
          </div>
        ) : null}

        {visibleMessages.map((message, index) => (
          <ChatMessageItem key={`${message.role}-${index}`} message={message} />
        ))}

        {sending && !likelyReceiptQuery ? (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:300ms]" />
                <span className="ml-1">Working on your request…</span>
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
