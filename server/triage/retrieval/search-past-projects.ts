import { createAnonClient } from "../supabase.js";
import { embedText } from "./embed.js";
import type {
  PastProjectMatch,
  SearchPastProjectsOptions,
} from "../types/portfolio.js";

type RpcRow = {
  id: string;
  slug: string;
  title: string;
  client_type: string;
  domain: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  phases: { name: string; hours: number }[];
  total_hours: number;
  similarity: number;
};

function toMatch(row: RpcRow): PastProjectMatch {
  const matchPercent = Math.round(row.similarity * 100);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client_type: row.client_type,
    domain: row.domain,
    problem: row.problem,
    solution: row.solution,
    tech_stack: row.tech_stack,
    phases: row.phases,
    total_hours: row.total_hours,
    similarity: row.similarity,
    matchPercent,
  };
}

/**
 * RAG retrieval — embeds the query and searches the portfolio corpus via pgvector.
 * Used by the agent's `search_past_projects` tool (Phase 5).
 */
export async function searchPastProjects(
  query: string,
  options: SearchPastProjectsOptions = {}
): Promise<PastProjectMatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const limit = options.limit ?? 5;
  const threshold = options.threshold ?? 0.35;

  const queryEmbedding = await embedText(trimmed, "query");
  const supabase = createAnonClient();

  const { data, error } = await supabase.rpc("match_past_projects", {
    query_embedding: queryEmbedding,
    match_count: limit,
    match_threshold: threshold,
  });

  if (error) {
    throw new Error(`Portfolio search failed: ${error.message}`);
  }

  return ((data as RpcRow[] | null) ?? []).map(toMatch);
}
