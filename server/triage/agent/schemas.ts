import { z } from "zod";

export const verdictSchema = z.enum([
  "Strong fit",
  "Possible fit",
  "Poor fit",
]);

export const scopeSizeSchema = z.enum(["Small", "Medium", "Large"]);

export const confidenceSchema = z.enum(["High", "Medium", "Low"]);

export const groundedProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  matchPercent: z.number().min(0).max(100),
});

export const tier1SnapshotSchema = z.object({
  verdict: verdictSchema,
  verdictReason: z.string(),
  projectType: z.string(),
  domain: z.string(),
  scopeSize: scopeSizeSchema,
  hoursBand: z.string().describe('e.g. "200–400h"'),
  suggestedStack: z.array(z.string()),
  routeToPod: z.string(),
  budgetMin: z.number(),
  budgetMax: z.number(),
  confidence: confidenceSchema,
  biggestRisk: z.string(),
  groundedProjects: z.array(groundedProjectSchema),
});

export const estimateRowSchema = z.object({
  role: z.string(),
  hours: z.number(),
  rate: z.number(),
  subtotal: z.number(),
});

export const tier2BreakdownSchema = z.object({
  requirements: z.array(z.string()),
  phases: z.array(
    z.object({
      name: z.string(),
      hours: z.number(),
    })
  ),
  estimateRows: z.array(estimateRowSchema),
  risks: z.array(z.string()),
  assumptions: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
  draftClientMessage: z.string(),
});

export const triageResultSchema = z.object({
  tier1: tier1SnapshotSchema,
  tier2: tier2BreakdownSchema,
});

export type TriageResult = z.infer<typeof triageResultSchema>;
export type Tier1Snapshot = z.infer<typeof tier1SnapshotSchema>;
export type Tier2Breakdown = z.infer<typeof tier2BreakdownSchema>;
