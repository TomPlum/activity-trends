import type { RangeKey } from "./ranges";
import type { WorkoutFilters } from "./workouts";

export const queryKeys = {
  profile: ["profile"] as const,
  dailyMetrics: (range: RangeKey) => ["daily-metrics", range] as const,
  overview: ["overview"] as const,
  workouts: (filters: WorkoutFilters) => ["workouts", filters] as const,
  workout: (id: string) => ["workout", id] as const,
  workoutRoute: (workoutId: string) => ["workout-route", workoutId] as const,
  workoutRouteIds: ["workout-route-ids"] as const,
  activitySummaries: (range: RangeKey) => ["activity-summaries", range] as const,
  sleep: (range: RangeKey) => ["sleep", range] as const,
  ecgList: ["ecg-list"] as const,
  ecg: (id: string) => ["ecg", id] as const,
  records: ["records"] as const,
  allRoutes: ["all-routes"] as const,
};
