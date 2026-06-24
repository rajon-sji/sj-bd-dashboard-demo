import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import path from "node:path";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Dev-only: serve POST /api/triage via Vite (production uses Vercel serverless). */
export function triageDevApiPlugin(): Plugin {
  return {
    name: "triage-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/triage") {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const handlerPath = path.resolve(
            server.config.root,
            "server/triage/handler.ts"
          );
          const { handleTriagePost } = await server.ssrLoadModule(handlerPath);
          const body = await readBody(req);

          const request = new Request("http://localhost/api/triage", {
            method: "POST",
            headers: {
              "Content-Type":
                (req.headers["content-type"] as string) ??
                "application/json",
            },
            body,
          });

          const response = (await handleTriagePost(request)) as Response;
          res.statusCode = response.status;
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

          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (error) {
          console.error("[triage-dev-api]", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : "Triage API error",
            })
          );
        }
      });
    },
  };
}
