-- Schema v2: richer daily metrics (mobility, nutrition, audio, etc.) plus ECG.
-- Driven by a HealthKit v14 export which carries far more than cardio + sleep.

alter table public.daily_metrics
  add column if not exists stand_hours          numeric,
  add column if not exists basal_energy         numeric,
  add column if not exists physical_effort       numeric,
  add column if not exists daylight_min          numeric,
  add column if not exists distance_cycling_km   numeric,
  add column if not exists walking_hr_avg        numeric,
  add column if not exists sleeping_wrist_temp_c numeric,
  -- mobility / gait
  add column if not exists walking_speed_kmh     numeric,
  add column if not exists step_length_cm        numeric,
  add column if not exists walking_asymmetry_pct numeric,
  add column if not exists double_support_pct    numeric,
  add column if not exists stair_ascent_speed    numeric,
  add column if not exists stair_descent_speed   numeric,
  add column if not exists walking_steadiness_pct numeric,
  -- hearing / audio exposure
  add column if not exists env_audio_db          numeric,
  add column if not exists headphone_audio_db    numeric,
  -- nutrition
  add column if not exists diet_energy_kcal      numeric,
  add column if not exists carbs_g               numeric,
  add column if not exists protein_g             numeric,
  add column if not exists fat_g                 numeric,
  add column if not exists sugar_g               numeric,
  add column if not exists fiber_g               numeric,
  add column if not exists sodium_mg             numeric,
  add column if not exists water_ml              numeric,
  add column if not exists caffeine_mg           numeric;

-- ---------------------------------------------------------------------------
-- ecg: one row per Apple Watch ECG recording (from electrocardiograms/*.csv)
-- ---------------------------------------------------------------------------
create table if not exists public.ecg (
  id                 uuid primary key default gen_random_uuid(),
  recorded_at        timestamptz not null,
  classification     text,
  symptoms           text,
  sample_rate_hz     numeric,
  average_heart_rate numeric,
  unit               text,
  sample_count       int not null default 0,
  device             text,
  software_version   text,
  -- full voltage waveform, microvolts
  samples            jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  unique (recorded_at)
);

alter table public.ecg enable row level security;
create policy "public read" on public.ecg for select using (true);
