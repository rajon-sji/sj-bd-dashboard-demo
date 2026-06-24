import { embed, embedMany } from "ai";

import {
  createGoogleEmbeddingModel,
  embedDocumentOptions,
  embedManyWithGroq,
  embedQueryOptions,
  embedWithGroq,
  getEmbeddingProvider,
} from "../ai.js";

export async function embedText(
  value: string,
  mode: "document" | "query" = "query"
): Promise<number[]> {
  if (getEmbeddingProvider() === "groq") {
    return embedWithGroq(value);
  }

  const { embedding } = await embed({
    model: createGoogleEmbeddingModel(),
    value,
    providerOptions:
      mode === "document" ? embedDocumentOptions : embedQueryOptions,
  });
  return embedding;
}

export async function embedTexts(values: string[]): Promise<number[][]> {
  if (values.length === 0) return [];

  if (getEmbeddingProvider() === "groq") {
    return embedManyWithGroq(values);
  }

  const { embeddings } = await embedMany({
    model: createGoogleEmbeddingModel(),
    values,
    providerOptions: embedDocumentOptions,
  });
  return embeddings;
}
