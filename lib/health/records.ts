import * as fmt from "@/lib/format";
import { workoutMeta } from "@/lib/health/workout-types";

export interface RecordWorkout {
  activity_type: string;
  distance_km: number | null;
  duration_min: number | null;
  energy_kcal: number | null;
  start_time: string;
}

/** A single best-day metric: the peak value and the date it happened. */
export interface DailyTop {
  date: string | null;
  value: number | null;
}

export interface DailyTops {
  steps?: DailyTop | null;
  active_energy?: DailyTop | null;
  exercise_min?: DailyTop | null;
  vo2max?: DailyTop | null;
  sleep_min?: DailyTop | null;
  flights_climbed?: DailyTop | null;
}

export interface PersonalRecord {
  key: string;
  label: string;
  value: string;
  detail?: string;
  /** lucide icon name; mapped to a component in the UI. */
  icon: string;
  accent: string;
  /** Whether this best came from a single workout or a daily-metric peak. */
  group: "workout" | "daily";
  /** The day the record was set (ISO), when known — used for recency. */
  date?: string | null;
}

function dateLabel(d: string | null | undefined): string | undefined {
  return d ? fmt.shortDate(d) : undefined;
}

/** Assemble the personal-records wall from all workouts + per-metric daily peaks. */
export function buildRecords(workouts: RecordWorkout[], tops: DailyTops): PersonalRecord[] {
  const records: PersonalRecord[] = [];

  // --- Workout-level records ---
  const withDistance = workouts.filter((w) => (w.distance_km ?? 0) > 0);

  const longest = withDistance.reduce<RecordWorkout | null>(
    (best, w) => (best == null || (w.distance_km ?? 0) > (best.distance_km ?? 0) ? w : best),
    null,
  );
  if (longest) {
    records.push({
      key: "longest-distance",
      label: "Longest workout",
      value: fmt.distanceKm(longest.distance_km, 1),
      detail: [workoutMeta(longest.activity_type).label, dateLabel(longest.start_time)]
        .filter(Boolean)
        .join(" · "),
      icon: "Route",
      accent: "text-chart-2",
      group: "workout",
      date: longest.start_time,
    });
  }

  // Pace is only comparable within foot sports — cycling would always "win".
  const FOOT_SPORTS = new Set(["Running", "Walking", "Hiking", "TrailRunning"]);
  const pacers = withDistance.filter(
    (w) => FOOT_SPORTS.has(w.activity_type) && (w.distance_km ?? 0) >= 1 && (w.duration_min ?? 0) > 0,
  );
  const fastest = pacers.reduce<RecordWorkout | null>((best, w) => {
    const pace = (w.duration_min as number) / (w.distance_km as number);
    if (best == null) return w;
    const bestPace = (best.duration_min as number) / (best.distance_km as number);
    return pace < bestPace ? w : best;
  }, null);
  if (fastest) {
    records.push({
      key: "fastest-pace",
      label: "Fastest pace",
      value: fmt.pace(fastest.distance_km, fastest.duration_min),
      detail: [workoutMeta(fastest.activity_type).label, dateLabel(fastest.start_time)]
        .filter(Boolean)
        .join(" · "),
      icon: "Zap",
      accent: "text-chart-3",
      group: "workout",
      date: fastest.start_time,
    });
  }

  const biggestBurn = workouts.reduce<RecordWorkout | null>(
    (best, w) => (best == null || (w.energy_kcal ?? 0) > (best.energy_kcal ?? 0) ? w : best),
    null,
  );
  if (biggestBurn && (biggestBurn.energy_kcal ?? 0) > 0) {
    records.push({
      key: "biggest-burn",
      label: "Biggest burn",
      value: `${fmt.number(biggestBurn.energy_kcal)} kcal`,
      detail: [workoutMeta(biggestBurn.activity_type).label, dateLabel(biggestBurn.start_time)]
        .filter(Boolean)
        .join(" · "),
      icon: "Flame",
      accent: "text-chart-4",
      group: "workout",
      date: biggestBurn.start_time,
    });
  }

  // --- Daily-peak records ---
  const daily = (
    top: DailyTop | null | undefined,
    cfg: { key: string; label: string; icon: string; accent: string; format: (v: number) => string },
  ) => {
    if (top?.value == null) return;
    records.push({
      key: cfg.key,
      label: cfg.label,
      value: cfg.format(top.value),
      detail: dateLabel(top.date),
      icon: cfg.icon,
      accent: cfg.accent,
      group: "daily",
      date: top.date,
    });
  };

  daily(tops.steps, {
    key: "most-steps",
    label: "Most steps",
    icon: "Footprints",
    accent: "text-chart-1",
    format: (v) => fmt.number(v),
  });
  daily(tops.active_energy, {
    key: "most-active-energy",
    label: "Most active energy",
    icon: "Flame",
    accent: "text-chart-3",
    format: (v) => `${fmt.number(v)} kcal`,
  });
  daily(tops.exercise_min, {
    key: "longest-exercise-day",
    label: "Longest exercise day",
    icon: "Timer",
    accent: "text-chart-4",
    format: (v) => fmt.duration(v),
  });
  daily(tops.vo2max, {
    key: "peak-vo2max",
    label: "Peak VO₂ Max",
    icon: "Gauge",
    accent: "text-chart-3",
    format: (v) => `${v.toFixed(1)} ml/kg`,
  });
  daily(tops.sleep_min, {
    key: "best-sleep",
    label: "Longest sleep",
    icon: "Moon",
    accent: "text-chart-2",
    format: (v) => fmt.duration(v),
  });
  daily(tops.flights_climbed, {
    key: "most-flights",
    label: "Most flights climbed",
    icon: "TrendingUp",
    accent: "text-chart-1",
    format: (v) => fmt.number(v),
  });

  return records;
}
