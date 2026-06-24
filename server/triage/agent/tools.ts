import { tool } from "ai";
import { z } from "zod";

import { computeBudgetRange, fetchRateCard } from "../budget";
import { searchPastProjects } from "../retrieval/search-past-projects";
import { createAnonClient } from "../supabase";

export const triageTools = {
  search_past_projects: tool({
    description:
      "Search SJ Innovation's real past project portfolio by semantic similarity. Call this to ground your verdict, stack, scope, and budget in evidence. Use a descriptive query (e.g. 'insurance CRM dashboard', 'WordPress eCommerce skincare'). Call again with a different query if the first results miss the mark.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "What kind of past work to find — domain, features, or tech hints from the brief"
        ),
      limit: z.number().min(1).max(8).optional().default(5),
    }),
    execute: async ({ query, limit }) => {
      const matches = await searchPastProjects(query, { limit });
      return matches.map((m) => ({
        slug: m.slug,
        title: m.title,
        domain: m.domain,
        client_type: m.client_type,
        tech_stack: m.tech_stack,
        total_hours: m.total_hours,
        match_percent: m.matchPercent,
        problem_summary: m.problem.slice(0, 280),
        solution_summary: m.solution.slice(0, 280),
      }));
    },
  }),

  get_pods: tool({
    description:
      "List internal SJI PODs / teams and their tech specialties. Use this to pick the 'route to' recommendation.",
    inputSchema: z.object({}),
    execute: async () => {
      const supabase = createAnonClient();
      const { data, error } = await supabase
        .from("pods")
        .select("slug, name, specialties, description")
        .order("name");

      if (error) throw new Error(`PODs fetch failed: ${error.message}`);
      return data ?? [];
    },
  }),

  get_rate_card: tool({
    description:
      "Fetch the hourly rate card used for budget arithmetic. Required before calculating budget.",
    inputSchema: z.object({}),
    execute: async () => fetchRateCard(),
  }),

  calculate_budget: tool({
    description:
      "Compute a defensible budget range from estimated hours × rate card. Never guess budget numbers — always use this tool after sizing hours from similar past projects.",
    inputSchema: z.object({
      hoursLow: z
        .number()
        .int()
        .positive()
        .describe("Low-end hour estimate for the scoped work"),
      hoursHigh: z
        .number()
        .int()
        .positive()
        .describe("High-end hour estimate for the scoped work"),
    }),
    execute: async ({ hoursLow, hoursHigh }) => {
      const rates = await fetchRateCard();
      return computeBudgetRange(
        Math.min(hoursLow, hoursHigh),
        Math.max(hoursLow, hoursHigh),
        rates
      );
    },
  }),
};
