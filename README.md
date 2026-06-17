# 📈 Activity Trends

A personal dashboard that visualises my Apple Health & Apple Watch data — workouts,
activity rings, heart & vitals, sleep and body composition.

Originally a Create React App frontend backed by a Kotlin/Spring + MongoDB API, it
was reworked into a **Next.js app on Vercel backed entirely by Supabase**, fed by a
local script that parses the full Apple Health export.

## Stack

| Concern        | Technology |
|----------------|------------|
| Framework      | [Next.js 15](https://nextjs.org) (App Router) · React 19 · TypeScript |
| Hosting        | [Vercel](https://vercel.com) |
| Backend / DB   | [Supabase](https://supabase.com) (Postgres, RLS public read-only) |
| Data fetching  | [TanStack Query](https://tanstack.com/query) + `@supabase/supabase-js` |
| UI             | [Tailwind v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Charts         | [Recharts](https://recharts.org) |
| Maps           | [MapLibre](https://maplibre.org) + [react-map-gl](https://visgl.github.io/react-map-gl/) (free OpenStreetMap tiles) |
| Ingestion      | Local Node/TS streaming parser ([saxes](https://github.com/lddubeau/saxes)) |

## Architecture

```
Apple Health export.zip (export.xml + workout-routes/*.gpx)
        │  npm run ingest   (local, re-runnable, service-role key)
        ▼
Supabase Postgres  ──RLS: anon = read-only──▶  Next.js (Vercel) via React Query
```

There is **no auth** — the dashboard is public read-only. Every table allows anon
`SELECT`; all writes go through the ingest script using the Supabase **secret key**,
which bypasses RLS.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project values
npm run dev
```

### Supabase setup

1. Create a Supabase project. Put the URL + **publishable key** in `.env.local`
   (`NEXT_PUBLIC_SUPABASE_*`) and the **secret key** in `SUPABASE_SECRET_KEY`.
   (These are the new key system; anon/service_role are legacy.)
2. Apply the migrations in [`supabase/migrations`](supabase/migrations) — either
   `supabase link` + `supabase db push`, or paste them into the SQL editor in order.
3. Regenerate types if you change the schema: `npm run db:types`.

### Ingesting your Apple Health data

Export from the iOS Health app (Profile → *Export All Health Data*) and unzip it.
You'll get `apple_health_export/export.xml` and an `workout-routes/` folder of GPX.

```bash
npm run ingest -- \
  --export ./data/export.xml \
  --routes ./data/workout-routes \
  --tz Europe/London
```

The script streams the (multi-GB) XML, loads workouts / records / activity summaries,
links GPX routes to workouts by time, loads sleep (from `data/fallback/sleep.csv` if
no `--sleep-csv` is given), and rebuilds the `daily_metrics` rollup. It is
idempotent — it resets the data tables first unless you pass `--no-reset`.

## Deployment (Vercel)

1. Import the repo in Vercel (Next.js is auto-detected).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both
   public and safe — reads are gated by RLS). The secret key is **not** needed on
   Vercel; ingestion runs locally.

## NPM scripts

| Name         | Description |
|--------------|-------------|
| `dev`        | Run the app locally. |
| `build`      | Production build. |
| `start`      | Serve the production build. |
| `lint`       | Next.js / ESLint. |
| `typecheck`  | `tsc --noEmit`. |
| `test`       | Vitest unit tests (ingestion parsers, etc.). |
| `ingest`     | Parse an Apple Health export into Supabase. |
| `db:types`   | Regenerate `lib/supabase/database.types.ts` from the DB. |
