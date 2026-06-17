-- Truncates the ingested data tables so the ingest script can do a clean,
-- idempotent reload. SECURITY DEFINER so the service role can call it via RPC.

create or replace function public.reset_health_data()
returns void
language plpgsql
security definer
as $$
begin
  truncate table
    public.workout_routes,
    public.workouts,
    public.health_records,
    public.activity_summaries,
    public.sleep_sessions,
    public.daily_metrics
  restart identity cascade;
end;
$$;
