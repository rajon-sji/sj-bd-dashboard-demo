import type { PastProject } from "@/types/portfolio";

/** Canonical text used for embeddings — keep in sync for index + query. */
export function projectToEmbeddingText(
  project: Pick<
    PastProject,
    | "title"
    | "client_type"
    | "domain"
    | "problem"
    | "solution"
    | "tech_stack"
  >
): string {
  return [
    `Title: ${project.title}`,
    `Client type: ${project.client_type}`,
    `Domain: ${project.domain}`,
    `Problem: ${project.problem}`,
    `Solution: ${project.solution}`,
    `Tech stack: ${project.tech_stack.join(", ")}`,
  ].join("\n");
}
