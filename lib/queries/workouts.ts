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
  category?: WorkoutCategory | "all";
}

export function useWorkouts(filters: WorkoutFilters) {
  return useQuery({
    queryKey: queryKeys.workouts(filters),
    queryFn: async (): Promise<Workout[]> => {
      const supabase = createClient();
      let query = supabase
        .from("workouts")
        .select("*")
        .order("start_time", { ascending: false });

      const since = rangeStartTimestamp(filters.range);
      if (since) query = query.gte("start_time", since);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
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
