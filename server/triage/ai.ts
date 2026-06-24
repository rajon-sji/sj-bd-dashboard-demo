import { google } from "@ai-sdk/google";

/** Isolated model config — swap provider here without touching agent logic. */
export const reasoningModel = google(
  process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash"
);

/** Matches pgvector column: past_projects.embedding vector(768) */
export const embeddingDimensions = 768;

export const embeddingModel = google.embeddingModel("gemini-embedding-001");

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
