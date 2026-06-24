/**
 * Generate embeddings for all past_projects and store in Supabase.
 * Requires: migration 001 applied, seed data loaded, GOOGLE_GENERATIVE_AI_API_KEY set.
 *
 * Usage: npm run db:embed
 */
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

import { projectToEmbeddingText } from "../../server/triage/retrieval/project-text";
import { embedTexts } from "../../server/triage/retrieval/embed";
import { getDatabaseConnectionString } from "./db-connection";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!apiKey) {
  console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function applyVectorIndex() {
  let connectionString: string | undefined;

  try {
    connectionString = getDatabaseConnectionString();
  } catch {
    console.log(
      "Skipping vector index (set SUPABASE_DB_PASSWORD or DATABASE_URL to auto-apply 002 migration)."
    );
    console.log("Or run supabase/migrations/002_vector_index.sql in SQL Editor.");
    return;
  }

  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations-triage/002_vector_index.sql"),
    "utf8"
  );
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Vector index applied (HNSW).");
  } finally {
    await client.end();
  }
}

async function embed() {
  const { data: projects, error } = await supabase
    .from("past_projects")
    .select(
      "id, slug, title, client_type, domain, problem, solution, tech_stack"
    )
    .order("title");

  if (error) throw error;
  if (!projects?.length) {
    console.error("No projects found. Run npm run db:seed first.");
    process.exit(1);
  }

  console.log(`Embedding ${projects.length} projects...`);

  const texts = projects.map((p) => projectToEmbeddingText(p));
  const embeddings = await embedTexts(texts);

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const { error: updateError } = await supabase
      .from("past_projects")
      .update({
        embedding: embeddings[i],
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (updateError) throw updateError;
    console.log(`  ✓ ${project.slug}`);
  }

  const { count } = await supabase
    .from("past_projects")
    .select("*", { count: "exact", head: true })
    .not("embedding", "is", null);

  console.log(`Done. ${count ?? projects.length} projects with embeddings.`);
  await applyVectorIndex();
}

embed().catch((err) => {
  console.error("Embed failed:", err.message ?? err);
  process.exit(1);
});
