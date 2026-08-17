import OpenAI from "openai";
import { createMcpClient } from "@/lib/server/chat/mcp-client";
import { toGroqTools } from "@/lib/server/chat/groq-tools";
import { ChatMessage, CleanReceipt, ForcedToolCall } from "@/lib/server/chat/chat-types";
import {dedupeReceipts, cleanReceipt,} from "@/lib/server/chat/receipt-normalizer";
import {extractReceiptsFromUnknown, extractTextFromAnyResult, parseToolArguments,} from "@/lib/server/chat/result-extractor";
import {executeSyntheticTool, isSyntheticToolName,} from "@/lib/server/chat/synthetic-tools";

export const runtime = "nodejs";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  let mcpClient: Awaited<ReturnType<typeof createMcpClient>> | null = null;

  try {
    const body = await req.json();

    const messages: ChatMessage[] = body.messages ?? [];
    if (!messages.length) {
      return Response.json({ error: "Missing messages" }, { status: 400 });
    }

    mcpClient = await createMcpClient();

    const listedTools = await mcpClient.listTools();
    const mcpTools = listedTools.tools ?? [];

    const groqTools = toGroqTools(mcpTools);

    let toolCalls: ForcedToolCall[] = [];

    const firstPass = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: [
              "You are a helpful receipt assistant.",
              "You can use MCP tools, MCP resources, and MCP prompts through the available functions.",
              "Use tools for mutations and exact receipt lookups.",
              "Use resources for summaries, recent receipts, category/date views, pagination, and similar prebuilt outputs.",
              "If the user selected a specific item in the UI, prioritize that item.",
              "Be concise, accurate, and practical.",
            ].join(" "),
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
        tools: groqTools,
        tool_choice: "auto",
        temperature: 0.2,
      });

      const modelMessage = firstPass.choices[0]?.message;

      if (!modelMessage) {
        return Response.json(
          { error: "No assistant message returned from Groq" },
          { status: 500 },
        );
      }

    const assistantMessage = {
        content: modelMessage.content ?? "",
        tool_calls: (modelMessage.tool_calls ?? [])
          .filter(
            (
              call,
            ): call is {
              id: string;
              type: "function";
              function: {
                name: string;
                arguments: string;
              };
            } => call.type === "function" && "function" in call,
          )
          .map((call) => ({
            id: call.id,
            type: "function" as const,
            function: {
              name: call.function.name,
              arguments: call.function.arguments,
            },
          })),
      };

    toolCalls = assistantMessage.tool_calls ?? [];

    if (!toolCalls.length) {
      return Response.json({
        outputText: assistantMessage?.content || "No response generated.",
        toolCalls: [],
        toolData: null,
      });
    }

    const toolResults: Array<{
      id: string;
      name: string;
      content: string;
    }> = [];

    let returnedReceipts: CleanReceipt[] = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const args = parseToolArguments(toolCall.function.arguments);

      try {
        if (!isSyntheticToolName(toolName)) {
          const selectedTool = mcpTools.find((tool) => tool.name === toolName);
          if (!selectedTool) {
            throw new Error(`Unknown MCP tool: ${toolName}`);
          }
          if (selectedTool.annotations?.readOnlyHint !== true) {
            throw new Error(
              `Mutation tool "${toolName}" requires explicit confirmation in the Tools menu.`,
            );
          }
        }

        const rawResult = isSyntheticToolName(toolName)
          ? await executeSyntheticTool(mcpClient, toolName, args)
          : await mcpClient.callTool({
              name: toolName,
              arguments: args,
            });

        const receipts = extractReceiptsFromUnknown(rawResult);

        if (receipts?.length) {
          returnedReceipts = [
            ...returnedReceipts,
            ...receipts.map(cleanReceipt),
          ];
        }

        toolResults.push({
          id: toolCall.id,
          name: toolName,
          content: extractTextFromAnyResult(rawResult),
        });
      } catch (error) {
        toolResults.push({
          id: toolCall.id,
          name: toolName,
          content:
            error instanceof Error
              ? `Tool execution failed: ${error.message}`
              : "Tool execution failed.",
        });
      }
    }

    const secondPass = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: [
            "You are a helpful receipt assistant.",
            "Use the tool, resource, and prompt outputs to answer clearly and naturally.",
            "Do not use markdown tables.",
            "Prefer short paragraphs or numbered lists.",
            "When listing receipts, use this format:",
            "1. Merchant — Date — Amount — Category — ID: shortId",
            "Use only the first 8 characters of a receipt ID unless the full ID is explicitly requested.",
            "Do not print raw image URLs unless the user explicitly asks for them.",
            "If an image exists, say 'image available'.",
            "Format dates as YYYY-MM-DD.",
            "Format currency naturally.",
            "Keep the answer compact and presentable.",
          ].join(" "),
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: "assistant" as const,
          content: assistantMessage?.content ?? "",
          tool_calls: toolCalls.map((call) => ({
            id: call.id,
            type: "function" as const,
            function: {
              name: call.function.name,
              arguments: call.function.arguments,
            },
          })),
        },
        ...toolResults.map((result) => ({
          role: "tool" as const,
          tool_call_id: result.id,
          content: result.content,
        })),
      ],
      tools: groqTools,
      tool_choice: "none",
      temperature: 0.2,
    });

    const finalMessage = secondPass.choices[0]?.message?.content;
    const finalReceipts = dedupeReceipts(returnedReceipts);

    return Response.json({
      outputText: finalMessage || "No final response generated.",
      toolCalls: toolResults.map((result) => ({
        id: result.id,
        name: result.name,
      })),
      toolData: finalReceipts.length
        ? {
            receipts: finalReceipts,
          }
        : null,
    });
  } catch (error) {
    console.error("[CHAT_ROUTE_ERROR]", error);

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    try {
      await mcpClient?.close();
    } catch {
      // Ignore close errors
    }
  }
}
