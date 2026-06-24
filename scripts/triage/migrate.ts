/**
 * Apply SQL migrations via direct Postgres connection.
 * Requires SUPABASE_DB_PASSWORD in .env (Supabase → Project Settings → Database).
 *
 * Usage: npm run db:migrate
 */
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import pg from "pg";

import { getDatabaseConnectionString, getSupabaseProjectRef } from "./db-connection";

config({ path: ".env.local" });
config({ path: ".env" });

const REGIONS_TO_TRY = [
  process.env.SUPABASE_REGION,
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-central-2",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "ap-south-2",
  "sa-east-1",
  "ca-central-1",
].filter((value, index, array): value is string => {
  return Boolean(value) && array.indexOf(value) === index;
});

const POOLER_PREFIXES = ["aws-0", "aws-1"];

async function connectClient(): Promise<pg.Client> {
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_HOST) {
    const client = new pg.Client({
      connectionString: getDatabaseConnectionString(),
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    return client;
  }

  const ref = getSupabaseProjectRef();
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!ref || !password) {
    throw new Error(
      "Set DATABASE_URL or both NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD in .env"
    );
  }

  const encodedPassword = encodeURIComponent(password);
  let lastError: unknown;

  for (const prefix of POOLER_PREFIXES) {
    for (const region of REGIONS_TO_TRY) {
      const connectionString = `postgresql://postgres.${ref}:${encodedPassword}@${prefix}-${region}.pooler.supabase.com:5432/postgres`;
      const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();
        if (!process.env.SUPABASE_REGION) {
          console.log(`Connected via Supabase pooler (${prefix}-${region}).`);
          console.log(
            `Tip: add SUPABASE_REGION=${region} to .env to skip region detection.`
          );
        }
        return client;
      } catch (error) {
        lastError = error;
        await client.end().catch(() => undefined);
      }
    }
  }

  throw lastError;
}

async function migrate() {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations-triage/001_initial_schema.sql"),
    "utf8"
  );

  const client = await connectClient();

  try {
    console.log("Applying migration...");
    await client.query(sql);
    console.log("Migration applied successfully.");
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Migration failed:", message);
  console.error(
    "\nIf this keeps failing, copy the Session pooler URI from Supabase → Project Settings → Database into DATABASE_URL in .env."
  );
  process.exit(1);
});
