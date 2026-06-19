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

## Supabase queries (`lib/queries/`)

Two gotchas when reading list/detail tables directly (not the pre-aggregated `daily_metrics`):

- **1000-row cap.** A `.select()` with no `.range()` silently truncates at 1000 rows — "all time" looks complete but isn't. Page through with `.range(offset, offset+SIZE-1)` until a short page returns (see `useWorkouts`).
- **Single-column selects type as `never`.** `database.types.ts` is hand-authored, so the PostgREST type parser can't resolve a narrowed `.select("col")` and infers `never`. Use `.select("*")`, or keep the narrow select and cast the result (`(res.data ?? []) as Array<{ col: T }>`, see `useWorkoutRouteIds`).

## Charts

`TrendChart` (`components/charts/trend-chart.tsx`) takes `data` + `series[]` (each `{ key, label, color, type?, unit? }`). The Y-axis appends a unit when unambiguous (single series' `unit`, or an explicit `yUnit` prop); `valueFormatter` formats the number only. `%` renders without a space.

`ConfigurableTrendChart` (`components/charts/configurable-trend-chart.tsx`) wraps `TrendChart` in a card with a metric selector (cycle through stats) + a `ChartTypeToggle` (bar/line/area) — pass `metrics[]`, each carrying its own pre-aggregated `{ date, value }[]`. Reuse it (plus `dashboard/table-pagination.tsx`, `dashboard/number-range-filter.tsx`, `dashboard/date-range-select.tsx`, `ui/popover.tsx`) before hand-rolling chart controls, paginated tables, or column filters. Per-metric colours come from the `--chart-*` tokens (`--workout` is the green Workouts accent); stat-card icon + sparkline + chart series for a metric should share one colour.

## Maps

`react-map-gl/maplibre` over **free CARTO raster basemaps** (no API key, like OSM). Shared helpers in `lib/map/`:

- `basemap.ts` — `basemapFor(theme)` returns the light/dark CARTO style; `routeColorsFor(theme)` gives theme-aware route colours. **maplibre paints to a `<canvas>` so it cannot read CSS variables** — every map colour is a baked hex here and in `sports.ts` (per-sport palette), never `var(--chart-*)`.
- `areas.ts` — `clusterRoutes()` groups routes by centroid proximity; `useActiveAreas()` reverse-geocodes the busiest cluster centres via **OSM Nominatim** (≤1 req/s, results cached in `localStorage`). Also exports `haversineKm`.
- Components: `route-map.tsx` (single workout) and `all-routes-map.tsx` (all routes overlaid; heat vs by-sport colour modes).

**Gotchas:** importing `Map` from `react-map-gl/maplibre` shadows the global `Map` constructor — use `Set`/objects or alias the import. The `/map` page fills the viewport via a flex column sized `h-[calc(100dvh-…)]` with the map card as `flex-1`.

## Insights

`lib/insights/engine.ts` is a **rule table** (`RULES`) over `DailyMetric` rows. `deriveInsights()` correlates each `driver → outcome` (optionally lagged a day) and emits a sentence only when `n ≥ 20` and `|r| ≥ 0.2`. **To add an insight, append a `Rule`** — no engine changes needed, and weak/absent relationships self-filter, so speculative additions are safe. `desirable` is the *expected* physiological sign: when the observed correlation matches it the insight reads as a confirmed/healthy pattern (green ↑), otherwise red ↓. Both `/insights` and the overview's `InsightList` (top 3) consume the same output.

## Conventions

- Hooks (e.g. `useActiveAreas`, `useDailyMetrics`) go at component top level, **never inside a `QueryView` render-prop** — derive data above `QueryView` and keep the `{(data) => …}` callback presentational, or the query toggling between pending/ready breaks the rules of hooks.
- Tests are colocated in `__tests__/` dirs, Vitest. Pure helpers and the ingest pipeline are well-covered — keep that up.
- Empty/loading/error UI goes through `QueryView` + `EmptyState`/`ChartSkeleton` in `components/dashboard/states.tsx`. Per-metric "no data" placeholders (e.g. Body tab BMI) are small in-card notices, not the full `EmptyState`.
- Default branch is `release`; branch before committing, and only commit/push when asked.
