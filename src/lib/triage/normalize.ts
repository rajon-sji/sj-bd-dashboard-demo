import type { TriageResult } from "@/lib/triage/schemas";

const SJI_HOURLY_RATE = 35;
const VALID_ROLES = new Set([
  "Engineer",
  "Project Manager",
  "Designer",
  "QA",
]);

function normalizeRole(role: string): string {
  const trimmed = role.trim();
  if (VALID_ROLES.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower.includes("engineer") || lower.includes("devops") || lower.includes("developer")) {
    return "Engineer";
  }
  if (lower.includes("project manager") || lower === "pm") return "Project Manager";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) {
    return "Designer";
  }
  if (lower.includes("qa") || lower.includes("quality")) return "QA";
  return "Engineer";
}

/** Flat $35/hr card — normalize roles and recalculate subtotals. */
export function normalizeTriageResult(result: TriageResult): TriageResult {
  return {
    tier1: {
      ...result.tier1,
      budgetMin: Math.round(result.tier1.budgetMin),
      budgetMax: Math.round(result.tier1.budgetMax),
      groundedProjects: result.tier1.groundedProjects.map((project) => ({
        ...project,
        matchPercent: Math.min(100, Math.max(0, Math.round(project.matchPercent))),
      })),
    },
    tier2: {
      ...result.tier2,
      estimateRows: result.tier2.estimateRows.map((row) => {
        const hours = Math.round(row.hours);
        const role = normalizeRole(row.role);
        return {
          role,
          hours,
          rate: SJI_HOURLY_RATE,
          subtotal: hours * SJI_HOURLY_RATE,
        };
      }),
      phases: result.tier2.phases.map((phase) => ({
        ...phase,
        hours: Math.round(phase.hours),
      })),
    },
  };
}
