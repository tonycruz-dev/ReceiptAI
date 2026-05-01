import { ChatMessage as ChatMessageType } from "@/lib/types";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = message.content?.trim();

  if (!text) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
          sm:max-w-[80%]
          ${
            isUser
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-900"
          }
        `}
      >
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}
