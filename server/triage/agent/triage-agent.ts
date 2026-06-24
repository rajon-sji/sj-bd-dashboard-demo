import { ToolLoopAgent, stepCountIs } from "ai";

import { createReasoningModel, type ModelSpec } from "../ai.js";
import {
  buildTriageInstructions,
  buildTriagePrompt,
} from "./prompt.js";
import { triageTools } from "./tools.js";
import type { BriefSource } from "../data/sample-briefs.js";

export function createTriageAgent(
  source?: BriefSource | "",
  model?: ModelSpec | string
) {
  return new ToolLoopAgent({
    model: createReasoningModel(model),
    instructions: buildTriageInstructions(source),
    tools: triageTools,
    // Structured output (JSON mode) conflicts with tool calling on Gemini 2.5;
    // final JSON is requested in instructions and parsed client-side.
    stopWhen: stepCountIs(12),
  });
}

export async function runTriage(brief: string, source?: BriefSource | "") {
  const agent = createTriageAgent(source);
  return agent.generate({ prompt: buildTriagePrompt(brief) });
}

export async function streamTriage(brief: string, source?: BriefSource | "") {
  const agent = createTriageAgent(source);
  return agent.stream({ prompt: buildTriagePrompt(brief) });
}

export type TriageAgent = ReturnType<typeof createTriageAgent>;
