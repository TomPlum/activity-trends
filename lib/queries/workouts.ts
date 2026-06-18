import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { queryKeys } from "./keys";
import { rangeStartTimestamp, type RangeKey } from "./ranges";
import type { WorkoutCategory } from "@/lib/health/workout-types";

export type Workout = Tables<"workouts">;
export type WorkoutRoute = Tables<"workout_routes">;

export interface WorkoutFilters {
  range: RangeKey;
  /** Explicit inclusive start timestamp; overrides `range` when set. */
  from?: string | null;
  /** Explicit inclusive end timestamp; pairs with `from` for a custom range. */
  until?: string | null;
  category?: WorkoutCategory | "all";
}

// Supabase caps a single response at 1000 rows, so all-time queries were
// silently truncated. Page through with .range() until a short page is returned.
const PAGE_SIZE = 1000;

export function useWorkouts(filters: WorkoutFilters) {
  return useQuery({
    queryKey: queryKeys.workouts(filters),
    queryFn: async (): Promise<Workout[]> => {
      const supabase = createClient();
      const since = filters.from ?? rangeStartTimestamp(filters.range);
      const until = filters.until ?? null;

      const all: Workout[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        let query = supabase
          .from("workouts")
          .select("*")
          .order("start_time", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        if (since) query = query.gte("start_time", since);
        if (until) query = query.lte("start_time", until);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < PAGE_SIZE) break;
      }
      return all;
    },
  });
}

/** Set of workout ids that have an associated GPS route, for map indicators. */
export function useWorkoutRouteIds() {
  return useQuery({
    queryKey: queryKeys.workoutRouteIds,
    queryFn: async (): Promise<Set<string>> => {
      const supabase = createClient();
      const ids = new Set<string>();
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const res = await supabase
          .from("workout_routes")
          .select("workout_id")
          .not("workout_id", "is", null)
          .range(offset, offset + PAGE_SIZE - 1);
        if (res.error) throw res.error;
        // The hand-authored Database types make a single-column select resolve to
        // `never`, so narrow the row shape explicitly.
        const data = (res.data ?? []) as Array<{ workout_id: string | null }>;
        if (data.length === 0) break;
        for (const row of data) if (row.workout_id) ids.add(row.workout_id);
        if (data.length < PAGE_SIZE) break;
      }
      return ids;
    },
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: queryKeys.workout(id),
    enabled: !!id,
    queryFn: async (): Promise<Workout | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkoutRoute(workoutId: string) {
  return useQuery({
    queryKey: queryKeys.workoutRoute(workoutId),
    enabled: !!workoutId,
    queryFn: async (): Promise<WorkoutRoute | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workout_routes")
        .select("*")
        .eq("workout_id", workoutId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
