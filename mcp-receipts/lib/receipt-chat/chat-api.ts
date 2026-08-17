import { ChatMessage } from "../types";
import type { ReceiptCardData } from "../types";

type ChatApiResponse = {
  outputText?: string;
  output_text?: string;
  toolData?: {
    receipts?: ReceiptCardData[];
  } | null;
};


export async function postChatRequest(params: {
  messages: Array<{ role: string; content: string }>;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let message = "Failed to send chat message";

    try {
      const errorData = await res.json();
      message = errorData?.details || errorData?.error || message;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return res.json();
}

export function buildAssistantMessage(data: ChatApiResponse): ChatMessage {
  return {
    role: "assistant",
    content:
      data.outputText ||
      data.output_text ||
      "I couldn't generate a response.",
    toolData: data.toolData ?? null,
  };
}
