import { createAgentUIStreamResponse } from "ai";

import { createTriageAgent } from "./agent/triage-agent";
import { buildTriagePrompt } from "./agent/prompt";
import type { BriefSource } from "./data/sample-briefs";
import { triageStreamErrorMessage } from "./stream-error";

export const maxDuration = 60;

type TriageRequestBody = {
  brief?: string;
  source?: BriefSource | "";
  messages?: unknown[];
};

export async function handleTriagePost(req: Request): Promise<Response> {
  let body: TriageRequestBody;

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const source = body.source ?? "";

  try {
    const agent = createTriageAgent(source);

    if (body.messages?.length) {
      return createAgentUIStreamResponse({
        agent,
        uiMessages: body.messages,
        onError: triageStreamErrorMessage,
      });
    }

    const brief = body.brief?.trim();
    if (!brief) {
      return Response.json(
        { error: "Paste a brief to get started." },
        { status: 400 }
      );
    }

    return createAgentUIStreamResponse({
      agent,
      uiMessages: [
        {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text: buildTriagePrompt(brief) }],
        },
      ],
      onError: triageStreamErrorMessage,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    console.error("[triage]", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
