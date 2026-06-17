-- Rebuilds public.daily_metrics from the raw stores. Called by the ingest
-- script after loading. Days are bucketed in the owner's local timezone so
-- "steps on the 5th" line up with the calendar rather than UTC.

create or replace function public.refresh_daily_metrics(tz text default 'Europe/London')
returns void
language plpgsql
as $$
begin
  delete from public.daily_metrics;

  insert into public.daily_metrics (
    date, steps, distance_km, flights_climbed, active_energy, exercise_min,
    resting_hr, avg_heart_rate, hrv_ms, vo2max, blood_oxygen, respiratory_rate,
    weight_kg, bmi, body_fat_pct, sleep_min, sleep_quality
  )
  with rec as (
    select
      (start_time at time zone tz)::date as d,
      type,
      value
    from public.health_records
  ),
  agg as (
    select
      d,
      sum(value) filter (where type = 'StepCount')                    as steps,
      sum(value) filter (where type = 'DistanceWalkingRunning')       as distance_km,
      sum(value) filter (where type = 'FlightsClimbed')               as flights_climbed,
      sum(value) filter (where type = 'ActiveEnergyBurned')           as active_energy,
      avg(value) filter (where type = 'RestingHeartRate')             as resting_hr,
      avg(value) filter (where type = 'HeartRate')                    as avg_heart_rate,
      avg(value) filter (where type = 'HeartRateVariabilitySDNN')     as hrv_ms,
      avg(value) filter (where type = 'VO2Max')                       as vo2max,
      avg(value) filter (where type = 'OxygenSaturation')            as blood_oxygen,
      avg(value) filter (where type = 'RespiratoryRate')             as respiratory_rate,
      avg(value) filter (where type = 'BodyMass')                    as weight_kg,
      avg(value) filter (where type = 'BodyMassIndex')               as bmi,
      avg(value) filter (where type = 'BodyFatPercentage')           as body_fat_pct
    from rec
    group by d
  ),
  -- attribute a night's sleep to the day you woke up (end_time local date)
  sleep as (
    select
      (coalesce(end_time, start_time) at time zone tz)::date as d,
      sum(duration_min) as sleep_min,
      avg(nullif(quality_pct, 0)) as sleep_quality
    from public.sleep_sessions
    where not is_nap
    group by 1
  ),
  act as (
    select date as d, exercise_min, active_energy_kcal
    from public.activity_summaries
  ),
  spine as (
    select d from agg
    union select d from sleep
    union select d from act
  )
  select
    s.d,
    a.steps,
    a.distance_km,
    a.flights_climbed,
    coalesce(a.active_energy, ac.active_energy_kcal) as active_energy,
    ac.exercise_min,
    a.resting_hr,
    a.avg_heart_rate,
    a.hrv_ms,
    a.vo2max,
    case when a.blood_oxygen <= 1 then a.blood_oxygen * 100 else a.blood_oxygen end as blood_oxygen,
    a.respiratory_rate,
    a.weight_kg,
    a.bmi,
    a.body_fat_pct,
    sl.sleep_min,
    sl.sleep_quality
  from spine s
  left join agg a    on a.d = s.d
  left join sleep sl on sl.d = s.d
  left join act ac   on ac.d = s.d
  where s.d is not null;
end;
$$;
