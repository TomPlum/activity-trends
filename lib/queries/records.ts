import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";

export type RecordWorkoutRow = Pick<
  Tables<"workouts">,
  "activity_type" | "distance_km" | "duration_min" | "energy_kcal" | "start_time"
>;
export type RecordDailyRow = Pick<
  Tables<"daily_metrics">,
  "date" | "steps" | "active_energy" | "exercise_min" | "vo2max" | "sleep_min" | "flights_climbed" | "resting_hr"
>;

export interface RecordsData {
  workouts: RecordWorkoutRow[];
  daily: RecordDailyRow[];
}

const PAGE = 1000;

/** Page through a table beyond PostgREST's 1000-row cap so records are exact. */
async function fetchAll<T>(
  table: "workouts" | "daily_metrics",
  columns: string,
  orderCol: string,
): Promise<T[]> {
  const supabase = createClient();
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderCol, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as unknown as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/** All workouts + daily metrics (minimal columns) for personal-record analysis. */
export function useRecords() {
  return useQuery({
    queryKey: queryKeys.records,
    queryFn: async (): Promise<RecordsData> => {
      const [workouts, daily] = await Promise.all([
        fetchAll<RecordWorkoutRow>(
          "workouts",
          "activity_type, distance_km, duration_min, energy_kcal, start_time",
          "start_time",
        ),
        fetchAll<RecordDailyRow>(
          "daily_metrics",
          "date, steps, active_energy, exercise_min, vo2max, sleep_min, flights_climbed, resting_hr",
          "date",
        ),
      ]);
      return { workouts, daily };
    },
  });
}
