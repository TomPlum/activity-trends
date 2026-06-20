/**
 * Pure helpers for the Activity dashboard: how each day's energy splits into
 * resting vs active burn, and how a metric varies by day of week. Date maths is
 * local-calendar (see CLAUDE.md) — `daily_metrics.date` is a local `yyyy-MM-dd`
 * key, so we parse it as local time and never touch UTC offsets.
 */
import { parseISO } from "date-fns";
import { mean } from "@/lib/stats";
import type { DailyMetric } from "@/lib/queries/metrics";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Keys of `daily_metrics` whose values are numeric (usable as a series). */
export type NumericMetricKey = {
  [K in keyof DailyMetric]: DailyMetric[K] extends number | null ? K : never;
}[keyof DailyMetric];

export interface WeekdayStat {
  day: string;
  /** Mean of the chosen metric on this weekday, or null if no days recorded. */
  value: number | null;
  days: number;
}

/**
 * Average a numeric daily metric grouped by day of week (Mon-first), keyed by
 * the local calendar day. Surfaces patterns like quieter weekdays at a desk vs
 * more active weekends.
 */
export function weekdayAverages(metrics: DailyMetric[], key: NumericMetricKey): WeekdayStat[] {
  const buckets = WEEKDAYS.map(() => ({ sum: 0, n: 0 }));
  for (const m of metrics) {
    const v = m[key] as number | null;
    if (v == null || !Number.isFinite(v)) continue;
    // JS getDay(): 0=Sun..6=Sat → Mon-first index.
    const idx = (parseISO(String(m.date)).getDay() + 6) % 7;
    buckets[idx].sum += v;
    buckets[idx].n += 1;
  }
  return WEEKDAYS.map((day, i) => ({
    day,
    value: buckets[i].n ? buckets[i].sum / buckets[i].n : null,
    days: buckets[i].n,
  }));
}

export interface EnergyPart {
  key: "resting" | "active";
  label: string;
  color: string;
  /** Mean kcal per day for this slice. */
  avgKcal: number;
  /** Share of the average day's total burn, 0–100. */
  pct: number;
}

export interface EnergyComposition {
  parts: EnergyPart[];
  /** Mean total daily burn (resting + active) in kcal. */
  totalKcal: number;
  /** Whether any resting (basal) energy was recorded — false ⇒ active only. */
  hasResting: boolean;
}

/**
 * Split the average day's energy expenditure into resting (basal) and active
 * (movement) kcal. Resting is the base your body burns just staying alive;
 * active is everything the red Move ring counts on top. Parts are ordered
 * resting-then-active so a gradient bar reads base-first.
 */
export function energyComposition(metrics: DailyMetric[]): EnergyComposition {
  const avgActive = mean(metrics.map((d) => d.active_energy)) ?? 0;
  const avgResting = mean(metrics.map((d) => d.basal_energy)) ?? 0;
  const hasResting = metrics.some((d) => d.basal_energy != null);
  const total = avgActive + avgResting;
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  const parts: EnergyPart[] = [
    { key: "resting", label: "Resting", color: "var(--chart-4)", avgKcal: avgResting, pct: pct(avgResting) },
    { key: "active", label: "Active", color: "var(--chart-3)", avgKcal: avgActive, pct: pct(avgActive) },
  ];
  return { parts, totalKcal: total, hasResting };
}
