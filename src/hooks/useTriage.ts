import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { BriefSource } from "@/data/triage/sample-briefs";
import {
  clearTriageSession,
  loadTriageSession,
  saveTriageSession,
} from "@/lib/triage/session-storage";
import {
  tier1SnapshotSchema,
  triageResultSchema,
  type TriageResult,
} from "@/lib/triage/schemas";
import { normalizeTriageResult } from "@/lib/triage/normalize";

export type TriageStatus = "idle" | "streaming" | "ready" | "error";

const triageApiUrl =
  import.meta.env.VITE_TRIAGE_API_URL?.trim() || "/api/triage";

function tryParseTriageJson(raw: string): TriageResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [
    trimmed,
    fenceMatch?.[1]?.trim(),
    trimmed.match(/\{[\s\S]*\}/)?.[0],
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate) as unknown;
      const full = triageResultSchema.safeParse(value);
      if (full.success) return normalizeTriageResult(full.data);

      if (value && typeof value === "object" && "tier1" in value) {
        const tier1Only = tier1SnapshotSchema.safeParse(
          (value as { tier1: unknown }).tier1
        );
        if (tier1Only.success) {
          return normalizeTriageResult({
            tier1: tier1Only.data,
            tier2: {
              requirements: [],
              phases: [],
              estimateRows: [],
              risks: [],
              assumptions: [],
              clarifyingQuestions: [],
              draftClientMessage: "",
            },
          });
        }
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

function extractTriageResult(message: UIMessage): TriageResult | null {
  for (const part of message.parts) {
    if (part.type !== "text") continue;
    const parsed = tryParseTriageJson(part.text);
    if (parsed) return parsed;
  }

  const combined = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return tryParseTriageJson(combined);
}

function mapChatStatus(
  status: "submitted" | "streaming" | "ready" | "error",
  hasStarted: boolean
): TriageStatus {
  if (!hasStarted) return "idle";
  if (status === "error") return "error";
  if (status === "ready") return "ready";
  return "streaming";
}

export function useTriage(
  brief: string,
  source: BriefSource | "",
  onSessionClear?: () => void
) {
  const restored = useMemo(() => loadTriageSession(), []);
  const [hasStarted, setHasStarted] = useState(
    () => Boolean(restored?.messages.length)
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: triageApiUrl,
        body: { source: source || undefined },
      }),
    [source]
  );

  const chat = useChat({
    transport,
    messages: restored?.messages,
  });

  const assistantMessage =
    chat.messages.find((message) => message.role === "assistant") ?? null;

  const result = assistantMessage
    ? extractTriageResult(assistantMessage)
    : restored?.result ?? null;

  const status = mapChatStatus(chat.status, hasStarted);

  useEffect(() => {
    if (status === "streaming") return;
    if (!hasStarted && !brief.trim()) return;

    const shouldPersist =
      status === "ready" || (status === "error" && chat.messages.length > 0);

    if (!shouldPersist) return;

    saveTriageSession({
      brief,
      source,
      messages: chat.messages,
      result,
      savedAt: new Date().toISOString(),
    });
  }, [brief, source, chat.messages, result, status, hasStarted]);

  const triage = useCallback(
    async (nextBrief: string) => {
      setHasStarted(true);
      chat.setMessages([]);
      await chat.sendMessage({ text: nextBrief });
    },
    [chat]
  );

  const reset = useCallback(() => {
    setHasStarted(false);
    chat.setMessages([]);
    clearTriageSession();
    onSessionClear?.();
  }, [chat, onSessionClear]);

  const error =
    chat.error instanceof Error
      ? chat.error.message
      : chat.error
        ? "Something went wrong."
        : null;

  const hasSavedSession = Boolean(restored?.result ?? result);

  return {
    message: assistantMessage,
    result,
    status,
    error,
    triage,
    reset,
    hasSavedSession,
  };
}
