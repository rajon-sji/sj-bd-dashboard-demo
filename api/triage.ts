import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Readable } from "node:stream";

import { handleTriagePost } from "../server/triage/handler";

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});

  const request = new Request("https://localhost/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const response = await handleTriagePost(request);

  res.status(response.status);
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "transfer-encoding" && lower !== "connection") {
      res.setHeader(key, value);
    }
  });

  if (!response.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(
    response.body as import("stream/web").ReadableStream
  );
  nodeStream.pipe(res);
}
