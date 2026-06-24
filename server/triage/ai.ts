import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type TriageProvider = "groq" | "google";

export type ModelSpec = {
  provider: TriageProvider;
  modelId: string;
};

const GROQ_DEFAULT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

const GOOGLE_DEFAULT_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
];

const GROQ_EMBEDDING_MODEL = "nomic-embed-text-v1.5";
const GOOGLE_EMBEDDING_MODEL = "gemini-embedding-001";

function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function hasGoogleKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}

function resolveLlmProvider(): TriageProvider {
  const configured = process.env.TRIAGE_LLM_PROVIDER?.trim().toLowerCase();
  if (configured === "groq" || configured === "google") return configured;
  if (hasGroqKey()) return "groq";
  return "google";
}

export function getEmbeddingProvider(): TriageProvider {
  const configured = process.env.TRIAGE_EMBEDDING_PROVIDER?.trim().toLowerCase();
  if (configured === "groq" || configured === "google") return configured;
  // Default: Google if corpus was embedded with Gemini (most existing deploys).
  // Set TRIAGE_EMBEDDING_PROVIDER=groq + re-run db:embed to switch.
  if (hasGoogleKey()) return "google";
  if (hasGroqKey()) return "groq";
  return "google";
}

function parseGroqModels(): string[] {
  const primary = process.env.GROQ_MODEL?.trim();
  const fallbacks = process.env.GROQ_MODEL_FALLBACKS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [
    ...(primary ? [primary] : []),
    ...(fallbacks?.length ? fallbacks : GROQ_DEFAULT_MODELS),
  ];
}

function parseGoogleModels(): string[] {
  const primary = process.env.GOOGLE_GENERATIVE_AI_MODEL?.trim();
  const fallbacks = process.env.GOOGLE_GENERATIVE_AI_MODEL_FALLBACKS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [
    ...(primary ? [primary] : []),
    ...(fallbacks?.length ? fallbacks : GOOGLE_DEFAULT_MODELS),
  ];
}

/** Ordered provider+model pairs for automatic LLM fallback. */
export function getReasoningModelCandidates(): ModelSpec[] {
  const primary = resolveLlmProvider();
  const secondary: TriageProvider = primary === "groq" ? "google" : "groq";

  const specs: ModelSpec[] = [];

  const addProvider = (provider: TriageProvider) => {
    if (provider === "groq" && !hasGroqKey()) return;
    if (provider === "google" && !hasGoogleKey()) return;

    const models =
      provider === "groq" ? parseGroqModels() : parseGoogleModels();
    for (const modelId of models) {
      specs.push({ provider, modelId });
    }
  };

  addProvider(primary);
  addProvider(secondary);

  const seen = new Set<string>();
  return specs.filter((spec) => {
    const key = `${spec.provider}:${spec.modelId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createReasoningModel(spec?: ModelSpec | string): LanguageModel {
  if (typeof spec === "string") {
    if (spec.startsWith("gemini")) return google(spec);
    return groq(spec);
  }

  const resolved =
    spec ??
    getReasoningModelCandidates()[0] ??
    ({ provider: "groq", modelId: "llama-3.3-70b-versatile" } satisfies ModelSpec);

  return resolved.provider === "groq"
    ? groq(resolved.modelId)
    : google(resolved.modelId);
}

/** Matches pgvector column: past_projects.embedding vector(768) */
export const embeddingDimensions = 768;

export function getEmbeddingModelId(): string {
  return getEmbeddingProvider() === "groq"
    ? GROQ_EMBEDDING_MODEL
    : GOOGLE_EMBEDDING_MODEL;
}

/** Google embeddings via AI SDK (default — matches existing Gemini-indexed corpus). */
export function createGoogleEmbeddingModel() {
  return google.embeddingModel(GOOGLE_EMBEDDING_MODEL);
}

export const embedDocumentOptions = {
  google: {
    outputDimensionality: embeddingDimensions,
    taskType: "RETRIEVAL_DOCUMENT" as const,
  },
};

export const embedQueryOptions = {
  google: {
    outputDimensionality: embeddingDimensions,
    taskType: "RETRIEVAL_QUERY" as const,
  },
};

/** Groq nomic embeddings via REST (768 dims). Requires npm run db:embed after switch. */
export async function embedWithGroq(text: string): Promise<number[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY for Groq embeddings.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_EMBEDDING_MODEL,
      input: text,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq embedding failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  const embedding = payload.data?.[0]?.embedding;
  if (!embedding?.length) {
    throw new Error("Groq embedding response was empty.");
  }

  return embedding;
}

export async function embedManyWithGroq(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await embedWithGroq(text));
  }
  return results;
}
