import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";

export interface RouteRow {
  id: string;
  workout_id: string | null;
  distance_km: number | null;
  bounds: unknown;
  points: unknown;
}

export interface RouteWorkout {
  id: string;
  activity_type: string;
  start_time: string;
}

export interface AllRoutesData {
  routes: RouteRow[];
  workouts: RouteWorkout[];
}

/** Every GPS route plus the minimal workout metadata needed to filter them. */
export function useAllRoutes() {
  return useQuery({
    queryKey: queryKeys.allRoutes,
    // Routes are immutable between ingests and the payload is large — cache hard.
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<AllRoutesData> => {
      const supabase = createClient();

      const { data: routes, error } = await supabase
        .from("workout_routes")
        .select("id, workout_id, distance_km, bounds, points");
      if (error) throw error;

      // Page through workouts (>1000) for the activity type / date of each route.
      const workouts: RouteWorkout[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error: e } = await supabase
          .from("workouts")
          .select("id, activity_type, start_time")
          .order("start_time", { ascending: true })
          .range(from, from + 999);
        if (e) throw e;
        const rows = (data ?? []) as RouteWorkout[];
        workouts.push(...rows);
        if (rows.length < 1000) break;
      }

      return { routes: (routes ?? []) as RouteRow[], workouts };
    },
  });
}
