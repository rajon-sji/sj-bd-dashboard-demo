export type ProjectPhase = {
  name: string;
  hours: number;
};

export type PastProject = {
  id: string;
  slug: string;
  title: string;
  client_type: string;
  domain: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  phases: ProjectPhase[];
  total_hours: number;
};

export type PastProjectMatch = PastProject & {
  /** Cosine similarity 0–1 from vector search */
  similarity: number;
  /** Rounded percentage for UI (e.g. 87) */
  matchPercent: number;
};

export type SearchPastProjectsOptions = {
  limit?: number;
  /** Minimum cosine similarity (0–1). Default 0.35 for small corpus. */
  threshold?: number;
};
