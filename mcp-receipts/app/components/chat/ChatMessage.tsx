import { ChatMessage as ChatMessageType } from "@/lib/types";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = message.content?.trim();
  const isMcpResult = !isUser && text?.startsWith("MCP operation completed.");
  const isError = !isUser && text?.startsWith("Error:");

  if (!text) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[92%] sm:max-w-[82%]">
        <div className={`mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${isUser ? "text-right text-zinc-400" : "text-zinc-400"}`}>
          {isUser ? "You" : isMcpResult ? "MCP result" : "Receipt AI"}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
          ${
            isUser
              ? "rounded-br-md bg-zinc-950 text-white shadow-zinc-950/10"
              : isError
                ? "rounded-bl-md border border-red-200 bg-red-50 text-red-800"
                : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800"
          }
        `}>
          {isMcpResult ? (
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-700">
              {text.replace("MCP operation completed.\n\n", "")}
            </pre>
          ) : (
            <div className="whitespace-pre-wrap">{text}</div>
          )}
        </div>
      </div>
    </div>
  );
}
