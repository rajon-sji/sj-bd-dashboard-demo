# SJ BD Dashboard — Triage Demo

Combined demo: SJ BD Dashboard shell + **BD Triage Copilot** feature.

## Quick start

```bash
npm install
npm run dev          # UI only at http://localhost:8080
npm run dev:full     # UI + /api/triage (requires Vercel CLI)
```

Open **http://localhost:8080/bd/triage** — no login required.

## Database setup (Triage Supabase)

Uses the separate Triage Supabase project (`lnssawroegemohftefrp`):

```bash
npm run db:migrate   # apply schema (pods, rate_card, past_projects + pgvector)
npm run db:seed      # seed portfolio corpus
npm run db:embed     # generate embeddings + vector index
```

## Deploy to Vercel

1. Create a new GitHub repo and push this project
2. Import in Vercel as a new project
3. **Connect your existing Triage Supabase** (e.g. `supabase-aero-compass` integration) **or** add env vars manually (see below)
4. Add `GOOGLE_GENERATIVE_AI_API_KEY` manually (not from Supabase integration)
5. Redeploy after env changes — Vite bakes env vars into the build

### Required env vars on Vercel

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase integration (auto) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` | Supabase integration (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase integration (auto) — for `/api/triage` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Add manually |
| `GOOGLE_GENERATIVE_AI_MODEL` | Optional (`gemini-2.5-flash`) |

**Optional** (also work; `vite.config.ts` maps `NEXT_PUBLIC_*` → client):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`

### White screen after deploy?

Usually missing env vars at **build** time. Connect Supabase integration + add Gemini key, then **Redeploy** (not just rebuild cache).

## Architecture

- **Frontend**: Vite + React (dashboard shell via `DemoLayout`)
- **Triage UI**: `src/components/triage/*`
- **Triage API**: `api/triage.ts` → `server/triage/*` (Vercel serverless)
- **Database**: Triage Supabase only (not production SJ CRM DB)

## Notes

- Other dashboard routes remain in the codebase but may not work with the Triage Supabase env — that is expected for this demo.
- This is a **demo fork**, not a production merge into `sjinnovation/sj-bd-dashboard`.
