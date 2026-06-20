/**
 * Pure helpers for deriving sleep analytics from `sleep_sessions` rows:
 * stage composition, sleep efficiency, schedule (bedtime/wake) and how
 * regular that schedule is. All date maths is local-calendar (see CLAUDE.md):
 * we read the wall-clock hour/minute of a timestamp, never UTC offsets.
 */
import { parseISO } from "date-fns";

const MS_PER_HOUR = 3_600_000;
const MIN_PER_DAY = 1440;

/** Minimal shape these helpers need — a subset of `SleepSession`. */
export interface SleepLike {
  start_time: string;
  end_time: string | null;
  duration_min: number | null;
  quality_pct: number | null;
  awake_min: number | null;
  rem_min: number | null;
  light_min: number | null;
  deep_min: number | null;
}

/** Local minutes past midnight for an ISO timestamp (0–1439). */
export function minutesIntoDay(iso: string): number {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** "23:34" from minutes past midnight; wraps modulo 24h. `null` → "—". */
export function clockLabel(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes)) return "—";
  const m = ((Math.round(minutes) % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export interface CircularTime {
  /** Mean time-of-day in minutes past midnight, or null when no input. */
  mean: number | null;
  /** Circular std-dev in minutes — schedule regularity (lower = steadier). */
  stdev: number | null;
}

/**
 * Average a set of times-of-day (minutes past midnight) on the 24h circle, so
 * 23:30 and 00:30 average to midnight rather than to noon. Also returns the
 * circular standard deviation, a "how regular is bedtime" measure in minutes.
 */
export function circularTimeStats(times: Array<number | null | undefined>): CircularTime {
  const mins = times.filter((t): t is number => t != null && Number.isFinite(t));
  if (!mins.length) return { mean: null, stdev: null };

  let sumSin = 0;
  let sumCos = 0;
  for (const t of mins) {
    const a = (t / MIN_PER_DAY) * 2 * Math.PI;
    sumSin += Math.sin(a);
    sumCos += Math.cos(a);
  }
  const meanSin = sumSin / mins.length;
  const meanCos = sumCos / mins.length;

  const raw = (Math.atan2(meanSin, meanCos) / (2 * Math.PI)) * MIN_PER_DAY;
  const mean = ((raw % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;

  const r = Math.sqrt(meanSin ** 2 + meanCos ** 2);
  const stdev = r > 0 ? (Math.sqrt(-2 * Math.log(r)) / (2 * Math.PI)) * MIN_PER_DAY : null;

  return { mean, stdev };
}

/**
 * Sleep efficiency: time asleep as a fraction of time in bed. Prefers the
 * ingest's `quality_pct` (computed against in-bed time when available) and
 * falls back to asleep / (asleep + awake).
 */
export function efficiencyPct(s: SleepLike): number | null {
  if (s.quality_pct != null) return s.quality_pct;
  const asleep = s.duration_min ?? 0;
  const inBed = asleep + (s.awake_min ?? 0);
  return inBed > 0 ? (asleep / inBed) * 100 : null;
}

/**
 * Hours elapsed since the "anchor noon" — noon of the day the night began. A
 * bedtime of 23:00 → 11, an after-midnight 01:00 → 13, a 07:00 wake → 19. This
 * lays an evening→morning night onto one continuous, monotonic axis so bedtime
 * and wake-up can be plotted as two drifting lines. Pass the session's
 * `start_time` as `anchorIso` for both bedtime and wake so they share a night.
 */
export function hoursSinceAnchorNoon(iso: string, anchorIso: string): number {
  const t = parseISO(iso).getTime();
  const anchor = parseISO(anchorIso);
  const wasMorning = anchor.getHours() < 12;
  anchor.setHours(12, 0, 0, 0);
  if (wasMorning) anchor.setDate(anchor.getDate() - 1);
  return (t - anchor.getTime()) / MS_PER_HOUR;
}

/** Inverse of {@link hoursSinceAnchorNoon} for axis ticks: hours → "HH:MM". */
export function clockFromNoonHours(hours: number): string {
  return clockLabel(720 + hours * 60);
}

export interface StageStat {
  key: "deep" | "rem" | "light" | "awake";
  label: string;
  color: string;
  /** Mean minutes per night across the supplied sessions. */
  avgMin: number;
  /** Share of the average night (0–100). */
  pct: number;
}

const STAGES: Array<{ key: StageStat["key"]; label: string; color: string; field: keyof SleepLike }> = [
  { key: "deep", label: "Deep", color: "var(--chart-5)", field: "deep_min" },
  { key: "rem", label: "REM", color: "var(--chart-3)", field: "rem_min" },
  { key: "light", label: "Light", color: "var(--chart-2)", field: "light_min" },
  { key: "awake", label: "Awake", color: "var(--chart-4)", field: "awake_min" },
];

/** Average minutes and share of each stage across the supplied sessions. */
export function stageBreakdown(sessions: SleepLike[]): { stages: StageStat[]; totalMin: number } {
  const n = sessions.length || 1;
  const avgs = STAGES.map((s) => ({
    ...s,
    avgMin: sessions.reduce((sum, x) => sum + ((x[s.field] as number | null) ?? 0), 0) / n,
  }));
  const total = avgs.reduce((sum, s) => sum + s.avgMin, 0);
  const stages: StageStat[] = avgs.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    avgMin: s.avgMin,
    pct: total > 0 ? (s.avgMin / total) * 100 : 0,
  }));
  return { stages, totalMin: total };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface WeekdayStat {
  day: string;
  /** Mean hours asleep on this weekday, or null if no nights recorded. */
  hours: number | null;
  nights: number;
}

/**
 * Average hours asleep grouped by day of week (Mon-first), keyed by the local
 * calendar day the night began. Surfaces patterns like weekend catch-up sleep.
 */
export function weekdayAverages(sessions: SleepLike[]): WeekdayStat[] {
  const buckets = WEEKDAYS.map(() => ({ sum: 0, n: 0 }));
  for (const s of sessions) {
    if (s.duration_min == null) continue;
    // JS getDay(): 0=Sun..6=Sat → Mon-first index.
    const idx = (parseISO(s.start_time).getDay() + 6) % 7;
    buckets[idx].sum += s.duration_min / 60;
    buckets[idx].n += 1;
  }
  return WEEKDAYS.map((day, i) => ({
    day,
    hours: buckets[i].n ? buckets[i].sum / buckets[i].n : null,
    nights: buckets[i].n,
  }));
}
