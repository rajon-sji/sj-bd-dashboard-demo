import { buildTriagePrompt } from "./agent/prompt.js";
import type { BriefSource } from "./data/sample-briefs.js";
import { runTriageWithModelFallback } from "./run-with-fallback.js";
import { triageStreamErrorMessage } from "./stream-error.js";

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
    const uiMessages =
      body.messages?.length ?
        body.messages
      : (() => {
          const brief = body.brief?.trim();
          if (!brief) return null;
          return [
            {
              id: crypto.randomUUID(),
              role: "user",
              parts: [{ type: "text", text: buildTriagePrompt(brief) }],
            },
          ];
        })();

    if (!uiMessages?.length) {
      return Response.json(
        { error: "Paste a brief to get started." },
        { status: 400 }
      );
    }

    return await runTriageWithModelFallback(source, uiMessages);
  } catch (error) {
    const message = triageStreamErrorMessage(error);
    console.error("[triage]", error);
    return Response.json({ error: message }, { status: 503 });
  }
}
