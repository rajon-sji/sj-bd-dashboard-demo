import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type GenerateTextResult,
  type UIMessage,
} from "ai";

import { getReasoningModelCandidates } from "./ai.js";
import { createTriageAgent } from "./agent/triage-agent.js";
import { triageTools } from "./agent/tools.js";

export function isModelCapacityError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const lower = message.toLowerCase();
  return (
    lower.includes("high demand") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("overloaded") ||
    lower.includes("failed after") ||
    lower.includes("503") ||
    lower.includes("429")
  );
}

function replayGenerateResultAsStream(
  uiMessages: unknown[],
  result: GenerateTextResult<typeof triageTools, never>
) {
  return createUIMessageStream({
    originalMessages: uiMessages as UIMessage[],
    execute: ({ writer }) => {
      writer.write({ type: "start" });

      for (const step of result.steps) {
        writer.write({ type: "start-step" });

        for (const toolCall of step.toolCalls) {
          writer.write({
            type: "tool-input-start",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
          });
          writer.write({
            type: "tool-input-available",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            input: "input" in toolCall ? toolCall.input : undefined,
          });
        }

        for (const toolResult of step.toolResults) {
          writer.write({
            type: "tool-output-available",
            toolCallId: toolResult.toolCallId,
            output: "output" in toolResult ? toolResult.output : undefined,
          });
        }

        writer.write({ type: "finish-step" });
      }

      const textId = "text-0";
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: result.text });
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
}

/**
 * Runs triage with automatic model fallback (generate, not stream).
 * Retries across Gemini models when one is busy — reliable under load.
 */
export async function runTriageWithModelFallback(
  source: Parameters<typeof createTriageAgent>[0],
  uiMessages: unknown[]
): Promise<Response> {
  const models = getReasoningModelCandidates();
  const modelMessages = await convertToModelMessages(
    (uiMessages as UIMessage[]).map(({ id: _id, ...message }) => message)
  );

  let lastError: unknown;

  for (const modelSpec of models) {
    try {
      console.info(
        `[triage] Running with ${modelSpec.provider}/${modelSpec.modelId}`
      );
      const agent = createTriageAgent(source, modelSpec);
      const result = await agent.generate({ messages: modelMessages });

      return createUIMessageStreamResponse({
        stream: replayGenerateResultAsStream(uiMessages, result),
      });
    } catch (error) {
      lastError = error;
      if (isModelCapacityError(error)) {
        console.warn(
          `[triage] ${modelSpec.provider}/${modelSpec.modelId} busy, trying next…`,
          error
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("All LLM models are unavailable.");
}
