import { ChatMessage } from "@/lib/types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          message.role === "user"
            ? "bg-zinc-900 text-white"
            : "border border-zinc-200 bg-white text-zinc-900"
        }`}
      >
        <div className="mb-1 text-[11px] uppercase tracking-wide opacity-60">
          {message.role}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
