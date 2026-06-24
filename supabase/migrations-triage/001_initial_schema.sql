-- BD Triage Copilot — initial schema
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- PODs / internal teams
-- ---------------------------------------------------------------------------
create table if not exists pods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  specialties text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rate card (drives deterministic budget math)
-- ---------------------------------------------------------------------------
create table if not exists rate_card (
  id uuid primary key default gen_random_uuid(),
  role text not null unique,
  hourly_rate numeric(10, 2) not null check (hourly_rate > 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Portfolio corpus (real SJI projects + augmented hours)
-- ---------------------------------------------------------------------------
create table if not exists past_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_type text not null,
  domain text not null,
  problem text not null,
  solution text not null,
  tech_stack text[] not null default '{}',
  phases jsonb not null default '[]',
  total_hours integer not null check (total_hours > 0),
  embedding vector(768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vector index is created in Phase 4 after embeddings are populated.

create index if not exists past_projects_domain_idx on past_projects (domain);
create index if not exists past_projects_client_type_idx on past_projects (client_type);

-- Similarity search — used by the agent's search_past_projects tool (Phase 4+)
create or replace function match_past_projects(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  slug text,
  title text,
  client_type text,
  domain text,
  problem text,
  solution text,
  tech_stack text[],
  phases jsonb,
  total_hours integer,
  similarity float
)
language sql stable
as $$
  select
    p.id,
    p.slug,
    p.title,
    p.client_type,
    p.domain,
    p.problem,
    p.solution,
    p.tech_stack,
    p.phases,
    p.total_hours,
    1 - (p.embedding <=> query_embedding) as similarity
  from past_projects p
  where p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- Public read for MVP (no auth). Writes only via service role / seed script.
alter table pods enable row level security;
alter table rate_card enable row level security;
alter table past_projects enable row level security;

create policy "Public read pods" on pods for select using (true);
create policy "Public read rate_card" on rate_card for select using (true);
create policy "Public read past_projects" on past_projects for select using (true);
