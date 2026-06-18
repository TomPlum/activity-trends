import type { DailyMetric } from "@/lib/queries/metrics";

export interface Insight {
  id: string;
  /** Plain-English headline. */
  text: string;
  /** Short category tag, e.g. "Sleep → Recovery". */
  tag: string;
  /** Pearson correlation coefficient (signed). */
  r: number;
  /** Number of aligned day-pairs the correlation was computed over. */
  n: number;
  /** Is this a favourable relationship for the user? Drives icon/colour. */
  sentiment: "positive" | "negative";
  /** Tailwind text-colour token for the accent. */
  accent: string;
}

type MetricKey = keyof DailyMetric;

interface Rule {
  id: string;
  driver: MetricKey;
  outcome: MetricKey;
  /** Days the outcome trails the driver. 0 = same day, 1 = next day. */
  lag: number;
  tag: string;
  accent: string;
  /** Sign of correlation that is healthy/desirable for this pairing. */
  desirable: "positive" | "negative";
  /**
   * Builds the sentence. `diff` is (high-driver-group mean − low-driver-group
   * mean) for the outcome, already rounded; `dir` says whether the outcome rose
   * or fell on high-driver days.
   */
  phrase: (diff: number, dir: "higher" | "lower") => string;
}

const MIN_N = 20;
const MIN_ABS_R = 0.2;

/** Pearson correlation over paired samples; null if degenerate. */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return null;
  return num / denom;
}

/** Mean of the outcome among the top vs bottom tertile of the driver. */
function tertileSplit(pairs: Array<[number, number]>): { high: number; low: number } | null {
  if (pairs.length < 6) return null;
  const sorted = [...pairs].sort((a, b) => a[0] - b[0]);
  const cut = Math.floor(sorted.length / 3);
  if (cut === 0) return null;
  const low = sorted.slice(0, cut);
  const high = sorted.slice(-cut);
  const mean = (rows: Array<[number, number]>) => rows.reduce((s, r) => s + r[1], 0) / rows.length;
  return { high: mean(high), low: mean(low) };
}

const RULES: Rule[] = [
  {
    id: "sleep-rhr",
    driver: "sleep_min",
    outcome: "resting_hr",
    lag: 1,
    tag: "Sleep → Recovery",
    accent: "text-chart-4",
    desirable: "negative",
    phrase: (d, dir) => `After your longest nights of sleep, next-day resting HR runs ${d} bpm ${dir}.`,
  },
  {
    id: "sleep-hrv",
    driver: "sleep_min",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Sleep → Recovery",
    accent: "text-chart-1",
    desirable: "positive",
    phrase: (d, dir) => `More sleep nudges your next-day HRV ${d} ms ${dir}.`,
  },
  {
    id: "exercise-rhr",
    driver: "exercise_min",
    outcome: "resting_hr",
    lag: 1,
    tag: "Training → Recovery",
    accent: "text-chart-4",
    desirable: "negative",
    phrase: (d, dir) => `Your hardest training days are followed by a resting HR ${d} bpm ${dir}.`,
  },
  {
    id: "exercise-hrv",
    driver: "exercise_min",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Training → Recovery",
    accent: "text-chart-1",
    desirable: "positive",
    phrase: (d, dir) => `Big exercise days shift next-day HRV ${d} ms ${dir}.`,
  },
  {
    id: "steps-sleep",
    driver: "steps",
    outcome: "sleep_min",
    lag: 0,
    tag: "Activity → Sleep",
    accent: "text-chart-2",
    desirable: "positive",
    phrase: (d, dir) => `On your most active days you sleep ${formatMinDiff(d)} ${dir === "higher" ? "longer" : "less"}.`,
  },
  {
    id: "caffeine-sleep",
    driver: "caffeine_mg",
    outcome: "sleep_min",
    lag: 0,
    tag: "Nutrition → Sleep",
    accent: "text-chart-3",
    desirable: "negative",
    phrase: (d, dir) => `Higher-caffeine days come with ${formatMinDiff(d)} ${dir === "higher" ? "more" : "less"} sleep.`,
  },
  {
    id: "daylight-sleep",
    driver: "daylight_min",
    outcome: "sleep_min",
    lag: 0,
    tag: "Daylight → Sleep",
    accent: "text-chart-2",
    desirable: "positive",
    phrase: (d, dir) => `More time in daylight tracks with ${formatMinDiff(d)} ${dir === "higher" ? "more" : "less"} sleep that night.`,
  },
  {
    id: "active-energy-hrv",
    driver: "active_energy",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Training → Recovery",
    accent: "text-chart-1",
    desirable: "positive",
    phrase: (d, dir) => `Days you burn the most energy move next-day HRV ${d} ms ${dir}.`,
  },
  {
    id: "sleep-quality-rhr",
    driver: "sleep_quality",
    outcome: "resting_hr",
    lag: 1,
    tag: "Sleep → Recovery",
    accent: "text-chart-4",
    desirable: "negative",
    phrase: (d, dir) => `Better sleep quality is followed by a resting HR ${d} bpm ${dir}.`,
  },
  {
    id: "respiratory-sleep",
    driver: "respiratory_rate",
    outcome: "sleep_quality",
    lag: 0,
    tag: "Vitals → Sleep",
    accent: "text-chart-2",
    desirable: "negative",
    phrase: (d, dir) => `Nights with a higher respiratory rate score ${Math.abs(d)} pts ${dir} on sleep quality.`,
  },
  {
    id: "wrist-temp-rhr",
    driver: "sleeping_wrist_temp_c",
    outcome: "resting_hr",
    lag: 1,
    tag: "Vitals → Recovery",
    accent: "text-chart-4",
    desirable: "positive",
    phrase: (d, dir) => `After the nights your wrist runs warmest, resting HR sits ${d} bpm ${dir}.`,
  },
  {
    id: "wrist-temp-hrv",
    driver: "sleeping_wrist_temp_c",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Vitals → Recovery",
    accent: "text-chart-1",
    desirable: "negative",
    phrase: (d, dir) => `A warmer overnight wrist temperature moves next-day HRV ${d} ms ${dir}.`,
  },
  {
    id: "respiratory-rhr",
    driver: "respiratory_rate",
    outcome: "resting_hr",
    lag: 1,
    tag: "Vitals → Recovery",
    accent: "text-chart-4",
    desirable: "positive",
    phrase: (d, dir) => `Nights with a higher respiratory rate precede a resting HR ${d} bpm ${dir}.`,
  },
  {
    id: "effort-hrv",
    driver: "physical_effort",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Training → Recovery",
    accent: "text-chart-1",
    desirable: "positive",
    phrase: (d, dir) => `Your highest-effort days shift next-day HRV ${d} ms ${dir}.`,
  },
  {
    id: "sugar-sleep-quality",
    driver: "sugar_g",
    outcome: "sleep_quality",
    lag: 0,
    tag: "Nutrition → Sleep",
    accent: "text-chart-3",
    desirable: "negative",
    phrase: (d, dir) => `Higher-sugar days score ${d} pts ${dir} on sleep quality.`,
  },
  {
    id: "water-rhr",
    driver: "water_ml",
    outcome: "resting_hr",
    lag: 1,
    tag: "Hydration → Recovery",
    accent: "text-chart-4",
    desirable: "negative",
    phrase: (d, dir) => `Your best-hydrated days are followed by a resting HR ${d} bpm ${dir}.`,
  },
  {
    id: "daylight-hrv",
    driver: "daylight_min",
    outcome: "hrv_ms",
    lag: 1,
    tag: "Daylight → Recovery",
    accent: "text-chart-1",
    desirable: "positive",
    phrase: (d, dir) => `More time in daylight nudges next-day HRV ${d} ms ${dir}.`,
  },
];

function formatMinDiff(minutes: number): string {
  const m = Math.abs(Math.round(minutes));
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m} min`;
}

/**
 * Derive plain-English insights from a chronological run of daily metrics.
 * Each rule correlates a driver metric against an outcome (optionally lagged a
 * day) and, when the relationship is strong and well-sampled enough, emits a
 * sentence quantifying the effect (high-driver vs low-driver day means).
 */
export function deriveInsights(metrics: DailyMetric[]): Insight[] {
  // Index by date for O(1) lag lookups.
  const byDate = new Map<string, DailyMetric>();
  for (const row of metrics) if (row.date) byDate.set(row.date, row);

  const dayMs = 864e5;
  const shift = (date: string, lag: number) =>
    new Date(new Date(`${date}T12:00:00`).getTime() + lag * dayMs).toISOString().slice(0, 10);

  const insights: Insight[] = [];

  for (const rule of RULES) {
    const pairs: Array<[number, number]> = [];
    for (const row of metrics) {
      if (!row.date) continue;
      const dv = row[rule.driver];
      if (dv == null) continue;
      const target = rule.lag === 0 ? row : byDate.get(shift(row.date, rule.lag));
      const ov = target?.[rule.outcome];
      if (ov == null) continue;
      pairs.push([dv as number, ov as number]);
    }

    if (pairs.length < MIN_N) continue;
    const r = pearson(
      pairs.map((p) => p[0]),
      pairs.map((p) => p[1]),
    );
    if (r == null || Math.abs(r) < MIN_ABS_R) continue;

    const split = tertileSplit(pairs);
    if (!split) continue;
    const rawDiff = split.high - split.low;
    if (rawDiff === 0) continue;

    const dir: "higher" | "lower" = rawDiff > 0 ? "higher" : "lower";
    const observedSign = r >= 0 ? "positive" : "negative";
    const sentiment = observedSign === rule.desirable ? "positive" : "negative";

    // Round the effect for display; HRV/HR/quality in integers, minutes raw.
    const diff = Math.round(Math.abs(rawDiff));
    if (diff === 0) continue;

    insights.push({
      id: rule.id,
      text: rule.phrase(diff, dir),
      tag: rule.tag,
      r,
      n: pairs.length,
      sentiment,
      accent: rule.accent,
    });
  }

  // Strongest relationships first.
  return insights.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
