import { embed, embedMany } from "ai";

import {
  embedDocumentOptions,
  embedQueryOptions,
  embeddingModel,
} from "../ai";

export async function embedText(
  value: string,
  mode: "document" | "query" = "query"
): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value,
    providerOptions:
      mode === "document" ? embedDocumentOptions : embedQueryOptions,
  });
  return embedding;
}

export async function embedTexts(values: string[]): Promise<number[][]> {
  if (values.length === 0) return [];

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values,
    providerOptions: embedDocumentOptions,
  });
  return embeddings;
}
