// Maps HealthKit workout activity types to display metadata. Carries forward
// the cardio/strength distinction from the old WorkoutType.isCardio helper.

export type WorkoutCategory = "cardio" | "strength" | "sport" | "mind" | "other";

export interface WorkoutTypeMeta {
  /** Canonical, human-friendly label. */
  label: string;
  category: WorkoutCategory;
  /** lucide-react icon name. */
  icon: string;
}

const META: Record<string, WorkoutTypeMeta> = {
  Running: { label: "Running", category: "cardio", icon: "Footprints" },
  Walking: { label: "Walking", category: "cardio", icon: "Footprints" },
  Cycling: { label: "Cycling", category: "cardio", icon: "Bike" },
  Elliptical: { label: "Elliptical", category: "cardio", icon: "Activity" },
  Hiking: { label: "Hiking", category: "cardio", icon: "Mountain" },
  Swimming: { label: "Swimming", category: "cardio", icon: "Waves" },
  Rowing: { label: "Rowing", category: "cardio", icon: "Waves" },
  HighIntensityIntervalTraining: { label: "HIIT", category: "cardio", icon: "Flame" },
  TraditionalStrengthTraining: { label: "Strength Training", category: "strength", icon: "Dumbbell" },
  FunctionalStrengthTraining: { label: "Functional Strength", category: "strength", icon: "Dumbbell" },
  CoreTraining: { label: "Core Training", category: "strength", icon: "Dumbbell" },
  Tennis: { label: "Tennis", category: "sport", icon: "Trophy" },
  Yoga: { label: "Yoga", category: "mind", icon: "Heart" },
  Other: { label: "Other", category: "other", icon: "Activity" },
};

const CARDIO = new Set([
  "Running",
  "Walking",
  "Cycling",
  "Elliptical",
  "Hiking",
  "Swimming",
  "Rowing",
  "HighIntensityIntervalTraining",
]);

/** Strip the "HKWorkoutActivityType" prefix from a raw export value. */
export function normaliseActivityType(raw: string): string {
  return raw.replace(/^HKWorkoutActivityType/, "");
}

export function workoutMeta(activityType: string): WorkoutTypeMeta {
  return META[activityType] ?? { label: activityType, category: "other", icon: "Activity" };
}

export function isCardio(activityType: string): boolean {
  return CARDIO.has(activityType);
}

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  cardio: "Cardio",
  strength: "Strength",
  sport: "Sport",
  mind: "Mind & Body",
  other: "Other",
};
