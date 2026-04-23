import { ChatMessage,  SelectedContext, ActionPayload } from "../types";


export async function postChatRequest(params: {
  messages: Array<{ role: string; content: string }>;
  selectedContext: SelectedContext;
  actionPayload?: ActionPayload;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAssistantMessage(data: any): ChatMessage {
  return {
    role: "assistant",
    content:
      data.outputText ||
      data.output_text ||
      "I couldn't generate a response.",
    toolData: data.toolData ?? null,
  };
}