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
3. Add all env vars from `.env` (see `.env.example.triage` for reference)
4. Deploy — `/api/triage` runs as a serverless function

## Architecture

- **Frontend**: Vite + React (dashboard shell via `DemoLayout`)
- **Triage UI**: `src/components/triage/*`
- **Triage API**: `api/triage.ts` → `server/triage/*` (Vercel serverless)
- **Database**: Triage Supabase only (not production SJ CRM DB)

## Notes

- Other dashboard routes remain in the codebase but may not work with the Triage Supabase env — that is expected for this demo.
- This is a **demo fork**, not a production merge into `sjinnovation/sj-bd-dashboard`.
