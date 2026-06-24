/**
 * Build a Postgres connection string for Supabase migrations/scripts.
 *
 * Prefer DATABASE_URL from the Supabase dashboard (Project Settings → Database).
 * Otherwise uses the session pooler — the legacy db.<ref>.supabase.co host is not
 * always provisioned on newer projects.
 */
export function getDatabaseConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!url || !password) {
    throw new Error(
      "Set DATABASE_URL or both NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD in .env"
    );
  }

  const ref = new URL(url).hostname.split(".")[0];
  const encodedPassword = encodeURIComponent(password);

  if (process.env.SUPABASE_DB_HOST) {
    const user = process.env.SUPABASE_DB_USER ?? `postgres.${ref}`;
    const port = process.env.SUPABASE_DB_PORT ?? "5432";
    return `postgresql://${user}:${encodedPassword}@${process.env.SUPABASE_DB_HOST}:${port}/postgres`;
  }

  const region = process.env.SUPABASE_REGION ?? "us-east-1";
  const prefix = process.env.SUPABASE_POOLER_PREFIX ?? "aws-1";
  const poolerHost = `${prefix}-${region}.pooler.supabase.com`;

  return `postgresql://postgres.${ref}:${encodedPassword}@${poolerHost}:5432/postgres`;
}

export function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}
