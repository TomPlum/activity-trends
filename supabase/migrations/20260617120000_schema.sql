-- Activity Trends — core schema
-- Personal Apple Health dashboard. Public read-only: anon may SELECT every table;
-- all writes happen through the local ingest script using the service-role key
-- (which bypasses RLS). No INSERT/UPDATE/DELETE policies are defined on purpose.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profile: a single row describing the owner (from the <Me> export element)
-- ---------------------------------------------------------------------------
create table if not exists public.profile (
  id              int primary key default 1,
  date_of_birth   date,
  biological_sex  text,
  blood_type      text,
  updated_at      timestamptz not null default now(),
  constraint profile_singleton check (id = 1)
);

-- ---------------------------------------------------------------------------
-- workouts: one row per Apple Health <Workout>
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id              uuid primary key default gen_random_uuid(),
  activity_type   text not null,                  -- e.g. "Running", "Elliptical"
  start_time      timestamptz not null,
  end_time        timestamptz,
  duration_min    numeric,
  distance_km     numeric,
  energy_kcal     numeric,
  avg_heart_rate  numeric,
  max_heart_rate  numeric,
  temperature_c   numeric,
  humidity        numeric,
  timezone        text,
  source          text,
  created_at      timestamptz not null default now(),
  unique (activity_type, start_time)              -- natural key for idempotent upsert
);
create index if not exists workouts_start_time_idx on public.workouts (start_time desc);
create index if not exists workouts_activity_type_idx on public.workouts (activity_type);

-- ---------------------------------------------------------------------------
-- workout_routes: GPS polyline for a workout (parsed from a .gpx file).
-- Points stored as JSONB [[lng, lat], ...] for direct consumption by MapLibre.
-- ---------------------------------------------------------------------------
create table if not exists public.workout_routes (
  id              uuid primary key default gen_random_uuid(),
  workout_id      uuid references public.workouts (id) on delete cascade,
  source          text,
  created_date    timestamptz,
  point_count     int not null default 0,
  distance_km     numeric,
  -- [west, south, east, north]
  bounds          jsonb,
  -- ordered array of [longitude, latitude] pairs (GeoJSON axis order)
  points          jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  unique (workout_id)
);

-- ---------------------------------------------------------------------------
-- activity_summaries: daily Apple activity rings (<ActivitySummary>)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_summaries (
  date                date primary key,
  active_energy_kcal  numeric,
  active_energy_goal  numeric,
  exercise_min        numeric,
  exercise_goal       numeric,
  stand_hours         numeric,
  stand_goal          numeric
);

-- ---------------------------------------------------------------------------
-- sleep_sessions: one row per sleep period (export sleep-analysis or Pillow CSV)
-- ---------------------------------------------------------------------------
create table if not exists public.sleep_sessions (
  id               uuid primary key default gen_random_uuid(),
  start_time       timestamptz not null,
  end_time         timestamptz,
  duration_min     numeric,
  quality_pct      numeric,
  awake_min        numeric,
  rem_min          numeric,
  light_min        numeric,
  deep_min         numeric,
  sounds_recorded  numeric,
  mood             text,
  is_nap           boolean not null default false,
  source           text,
  unique (start_time)
);
create index if not exists sleep_sessions_start_time_idx on public.sleep_sessions (start_time desc);

-- ---------------------------------------------------------------------------
-- health_records: generic long-format store for the high-volume quantity /
-- category series. `type` is the short HealthKit identifier with the
-- HKQuantityTypeIdentifier / HKCategoryTypeIdentifier prefix stripped, e.g.
-- "StepCount", "HeartRate", "HeartRateVariabilitySDNN", "VO2Max", "BodyMass".
-- ---------------------------------------------------------------------------
create table if not exists public.health_records (
  id           bigint generated always as identity primary key,
  type         text not null,
  unit         text,
  value        numeric,
  start_time   timestamptz not null,
  end_time     timestamptz,
  source       text
);
create index if not exists health_records_type_start_idx
  on public.health_records (type, start_time);

-- ---------------------------------------------------------------------------
-- daily_metrics: pre-aggregated per-day rollup the dashboard reads from.
-- Populated by public.refresh_daily_metrics() after each ingest so the client
-- never has to scan millions of raw health_records rows.
-- ---------------------------------------------------------------------------
create table if not exists public.daily_metrics (
  date               date primary key,
  steps              numeric,
  distance_km        numeric,
  flights_climbed    numeric,
  active_energy      numeric,
  exercise_min       numeric,
  resting_hr         numeric,
  avg_heart_rate     numeric,
  hrv_ms             numeric,
  vo2max             numeric,
  blood_oxygen       numeric,
  respiratory_rate   numeric,
  weight_kg          numeric,
  bmi                numeric,
  body_fat_pct       numeric,
  sleep_min          numeric,
  sleep_quality      numeric
);

-- ---------------------------------------------------------------------------
-- Row Level Security: enable on every table, allow public SELECT only.
-- ---------------------------------------------------------------------------
alter table public.profile            enable row level security;
alter table public.workouts           enable row level security;
alter table public.workout_routes     enable row level security;
alter table public.activity_summaries enable row level security;
alter table public.sleep_sessions     enable row level security;
alter table public.health_records     enable row level security;
alter table public.daily_metrics      enable row level security;

create policy "public read" on public.profile            for select using (true);
create policy "public read" on public.workouts           for select using (true);
create policy "public read" on public.workout_routes     for select using (true);
create policy "public read" on public.activity_summaries for select using (true);
create policy "public read" on public.sleep_sessions     for select using (true);
create policy "public read" on public.health_records     for select using (true);
create policy "public read" on public.daily_metrics      for select using (true);
