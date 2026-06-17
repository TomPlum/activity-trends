import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { DailyMetric } from "./metrics";
import type { Workout } from "./workouts";
import type { ActivitySummary } from "./activity";

export interface OverviewData {
  /** Up to the last 365 days of rollups (sparklines slice the recent 90). */
  recentMetrics: DailyMetric[];
  latestActivity: ActivitySummary | null;
  lastWorkout: Workout | null;
  /** Most recent non-null value for a handful of headline vitals. */
  latest: {
    restingHr: number | null;
    hrv: number | null;
    vo2max: number | null;
    weightKg: number | null;
  };
}

function latestNonNull(rows: DailyMetric[], key: keyof DailyMetric): number | null {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = rows[i][key];
    if (v != null) return v as number;
  }
  return null;
}

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: async (): Promise<OverviewData> => {
      const supabase = createClient();
      const since = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);

      const [metricsRes, activityRes, workoutRes] = await Promise.all([
        supabase.from("daily_metrics").select("*").gte("date", since).order("date"),
        supabase
          .from("activity_summaries")
          .select("*")
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("workouts")
          .select("*")
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (metricsRes.error) throw metricsRes.error;
      const recentMetrics = metricsRes.data ?? [];

      return {
        recentMetrics,
        latestActivity: activityRes.data ?? null,
        lastWorkout: workoutRes.data ?? null,
        latest: {
          restingHr: latestNonNull(recentMetrics, "resting_hr"),
          hrv: latestNonNull(recentMetrics, "hrv_ms"),
          vo2max: latestNonNull(recentMetrics, "vo2max"),
          weightKg: latestNonNull(recentMetrics, "weight_kg"),
        },
      };
    },
  });
}
