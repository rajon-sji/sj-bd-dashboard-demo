/**
 * Seed the Supabase database with PODs, rate card, and portfolio corpus.
 *
 * Prerequisites:
 * 1. Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
 * 2. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage: npm run db:seed
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { seedPods, seedProjects, seedRateCard } from "./seed-data";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  console.log("Seeding pods...");
  const { error: podsError } = await supabase.from("pods").upsert(seedPods, {
    onConflict: "slug",
  });
  if (podsError) throw podsError;

  console.log("Seeding rate card...");
  const { error: ratesError } = await supabase.from("rate_card").upsert(
    seedRateCard,
    { onConflict: "role" }
  );
  if (ratesError) throw ratesError;

  console.log("Seeding past projects...");
  const { error: projectsError } = await supabase
    .from("past_projects")
    .upsert(seedProjects, { onConflict: "slug" });
  if (projectsError) throw projectsError;

  const { count } = await supabase
    .from("past_projects")
    .select("*", { count: "exact", head: true });

  console.log(`Done. ${count ?? seedProjects.length} projects in corpus.`);
  console.log(
    "Embeddings are empty until Phase 4 (run npm run db:embed after migration)."
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
