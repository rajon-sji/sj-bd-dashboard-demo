import type { UIMessage } from "ai";

import type { BriefSource } from "@/data/triage/sample-briefs";
import type { TriageResult } from "@/lib/triage/schemas";
import { triageResultSchema } from "@/lib/triage/schemas";

const STORAGE_KEY = "sj-bd-triage-session";

export type TriageSession = {
  brief: string;
  source: BriefSource | "";
  messages: UIMessage[];
  result: TriageResult | null;
  savedAt: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadTriageSession(): TriageSession | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Partial<TriageSession>;
    if (typeof record.brief !== "string" || !Array.isArray(record.messages)) {
      return null;
    }

    const result =
      record.result != null
        ? triageResultSchema.safeParse(record.result).success
          ? triageResultSchema.parse(record.result)
          : null
        : null;

    return {
      brief: record.brief,
      source: (record.source ?? "") as BriefSource | "",
      messages: record.messages as UIMessage[],
      result,
      savedAt: typeof record.savedAt === "string" ? record.savedAt : "",
    };
  } catch {
    return null;
  }
}

export function saveTriageSession(session: TriageSession): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...session,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Quota exceeded or private mode — ignore
  }
}

export function clearTriageSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
