// Maps HealthKit record types to daily_metrics columns and how to aggregate
// them. High-frequency series are tallied in memory (never stored raw); a small
// set of low-volume series are ALSO kept raw in health_records for drill-down.

export type Agg = "sum" | "avg";

export interface DailyRule {
  column: string;
  agg: Agg;
  /** Multiply by 100 when the source value is a 0–1 fraction. */
  pct?: boolean;
}

/** shortType -> daily rollup rule. */
export const DAILY_RULES: Record<string, DailyRule> = {
  StepCount: { column: "steps", agg: "sum" },
  DistanceWalkingRunning: { column: "distance_km", agg: "sum" },
  DistanceCycling: { column: "distance_cycling_km", agg: "sum" },
  FlightsClimbed: { column: "flights_climbed", agg: "sum" },
  BasalEnergyBurned: { column: "basal_energy", agg: "sum" },
  HeartRate: { column: "avg_heart_rate", agg: "avg" },
  RestingHeartRate: { column: "resting_hr", agg: "avg" },
  WalkingHeartRateAverage: { column: "walking_hr_avg", agg: "avg" },
  HeartRateVariabilitySDNN: { column: "hrv_ms", agg: "avg" },
  VO2Max: { column: "vo2max", agg: "avg" },
  OxygenSaturation: { column: "blood_oxygen", agg: "avg", pct: true },
  RespiratoryRate: { column: "respiratory_rate", agg: "avg" },
  BodyMass: { column: "weight_kg", agg: "avg" },
  BodyMassIndex: { column: "bmi", agg: "avg" },
  BodyFatPercentage: { column: "body_fat_pct", agg: "avg", pct: true },
  PhysicalEffort: { column: "physical_effort", agg: "avg" },
  TimeInDaylight: { column: "daylight_min", agg: "sum" },
  AppleSleepingWristTemperature: { column: "sleeping_wrist_temp_c", agg: "avg" },
  // mobility / gait
  WalkingSpeed: { column: "walking_speed_kmh", agg: "avg" },
  WalkingStepLength: { column: "step_length_cm", agg: "avg" },
  WalkingAsymmetryPercentage: { column: "walking_asymmetry_pct", agg: "avg", pct: true },
  WalkingDoubleSupportPercentage: { column: "double_support_pct", agg: "avg", pct: true },
  StairAscentSpeed: { column: "stair_ascent_speed", agg: "avg" },
  StairDescentSpeed: { column: "stair_descent_speed", agg: "avg" },
  AppleWalkingSteadiness: { column: "walking_steadiness_pct", agg: "avg", pct: true },
  // hearing / audio
  EnvironmentalAudioExposure: { column: "env_audio_db", agg: "avg" },
  HeadphoneAudioExposure: { column: "headphone_audio_db", agg: "avg" },
  // nutrition
  DietaryEnergyConsumed: { column: "diet_energy_kcal", agg: "sum" },
  DietaryCarbohydrates: { column: "carbs_g", agg: "sum" },
  DietaryProtein: { column: "protein_g", agg: "sum" },
  DietaryFatTotal: { column: "fat_g", agg: "sum" },
  DietarySugar: { column: "sugar_g", agg: "sum" },
  DietaryFiber: { column: "fiber_g", agg: "sum" },
  DietarySodium: { column: "sodium_mg", agg: "sum" },
  DietaryWater: { column: "water_ml", agg: "sum" },
  DietaryCaffeine: { column: "caffeine_mg", agg: "sum" },
};

/**
 * Low-volume types also kept raw in health_records (a few thousand rows each),
 * so we can build intra-day / point views later without re-architecting.
 */
export const RAW_TYPES = new Set([
  "RestingHeartRate",
  "HeartRateVariabilitySDNN",
  "VO2Max",
  "OxygenSaturation",
  "BodyMass",
  "BodyMassIndex",
  "BodyFatPercentage",
  "WalkingHeartRateAverage",
  "AppleWalkingSteadiness",
  "SixMinuteWalkTestDistance",
  "HeartRateRecoveryOneMinute",
  "AppleSleepingWristTemperature",
]);

/** Columns whose final daily value is a percentage that may arrive as a fraction. */
export const PCT_COLUMNS = new Set(
  Object.values(DAILY_RULES)
    .filter((r) => r.pct)
    .map((r) => r.column),
);

/**
 * Types we surface but don't map directly to a column — used to derive other
 * metrics. Height feeds BMI when Apple didn't record a BodyMassIndex value.
 */
export const DERIVE_TYPES = new Set(["Height"]);

/** Every type the streamer should surface (daily-mapped ∪ raw ∪ derive). */
export function ingestRecordTypes(): Set<string> {
  return new Set([...Object.keys(DAILY_RULES), ...RAW_TYPES, ...DERIVE_TYPES]);
}
