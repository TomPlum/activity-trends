# CLAUDE.md

Personal Apple Health dashboard: **Next.js 15 (App Router) · React 19 · TS · Supabase · TanStack Query · Tailwind v4 · shadcn/ui · Recharts**. A local streaming script parses the multi-GB Apple Health export into Supabase; the dashboard is public **read-only** (no auth — RLS allows anon `SELECT`, all writes use the Supabase secret key via the ingest script). See [README.md](README.md) for setup/stack prose; this file is the working map for changes.

## Commands

```bash
npm run dev        # next dev
npm run build      # next build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run test       # vitest run  (test:watch for watch mode)
npm run ingest -- --export <export.xml> --routes <dir> --ecg <dir>   # see below
npm run db:types   # regenerate lib/supabase/database.types.ts from local Supabase
```

Run `npm run typecheck && npm run test` before considering a change done.

## Layout

- `app/<tab>/page.tsx` — one route per health domain (activity, body, heart, sleep, mobility, nutrition, hearing, ecg, map, insights, records). Client components using TanStack Query hooks.
- `lib/queries/` — React Query hooks. `useDailyMetrics(range)` is the workhorse, reading the `daily_metrics` table. `lib/queries/ranges.ts` defines `RangeKey`.
- `lib/supabase/database.types.ts` — generated; the source of truth for table columns. Don't hand-edit beyond regenerating.
- `lib/{stats,format,fitness,health,insights}` — pure helpers (unit-tested).
- `components/charts/` — `trend-chart.tsx` (the shared `TrendChart`), `sparkline.tsx`, `ecg-waveform.tsx`, etc.
- `scripts/ingest/` — the export parser (see below). Tests live in `scripts/ingest/__tests__/`.
- `supabase/migrations/` — ordered SQL. Schema changes go here, then `npm run db:types`.

## Ingest pipeline (`scripts/ingest/`)

Streams `export.xml` with `saxes`, aggregating high-frequency series **in memory** into daily roll-ups so the giant series (heart rate, steps, energy…) never hit the DB. Only low-volume series are also stored raw in `health_records`. Resets data tables first by default (`--no-reset` to skip).

- `index.ts` — CLI entrypoint + Supabase writes.
- `health-export.ts` — the SAX streamer; emits workouts/records/activity-summaries/sleep/profile via handlers.
- `metric-config.ts` — **the mapping config.** `DAILY_RULES` maps a HealthKit short-type → `daily_metrics` column + aggregation (`sum`/`avg`, `pct` for 0–1 fractions). `RAW_TYPES` = also kept raw. `DERIVE_TYPES` = surfaced only to compute other metrics (e.g. `Height` → BMI).
- `daily.ts` — `DailyAccumulator`: tallies records, holds direct values (rings/sleep), derives BMI from weight+height when Apple recorded none.

**Gotcha — two record-type sets.** `health-export.ts` has a `DEFAULT_RECORD_TYPES` constant, but the CLI does **not** use it: `index.ts` passes `ingestRecordTypes()` (= `DAILY_RULES ∪ RAW_TYPES ∪ DERIVE_TYPES`). To make the streamer surface a new type, add it to one of those sets in `metric-config.ts` — editing `DEFAULT_RECORD_TYPES` has no effect on a real ingest.

### Adding a new daily metric

1. Add a migration adding the column to `daily_metrics`; `npm run db:types`.
2. Add a `DAILY_RULES` entry (and `RAW_TYPES`/`DERIVE_TYPES` if needed) in `metric-config.ts`.
3. Surface it in the relevant `app/<tab>/page.tsx` (StatCard + `TrendChart`).
4. Add/extend tests in `scripts/ingest/__tests__/`.

## Charts

`TrendChart` (`components/charts/trend-chart.tsx`) takes `data` + `series[]` (each `{ key, label, color, type?, unit? }`). The Y-axis appends a unit when unambiguous (single series' `unit`, or an explicit `yUnit` prop); `valueFormatter` formats the number only. `%` renders without a space.

## Conventions

- Tests are colocated in `__tests__/` dirs, Vitest. Pure helpers and the ingest pipeline are well-covered — keep that up.
- Empty/loading/error UI goes through `QueryView` + `EmptyState`/`ChartSkeleton` in `components/dashboard/states.tsx`. Per-metric "no data" placeholders (e.g. Body tab BMI) are small in-card notices, not the full `EmptyState`.
- Default branch is `release`; branch before committing, and only commit/push when asked.
