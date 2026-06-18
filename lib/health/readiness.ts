import type { DailyMetric } from "@/lib/queries/metrics";

export interface ReadinessContributor {
  key: "hrv" | "rhr" | "sleep" | "load";
  label: string;
  /** Sub-score 0..100. */
  score: number;
}

export interface ReadinessDay {
  date: string;
  /** Composite 0..100, or null if nothing could be scored that day. */
  score: number | null;
  contributors: ReadinessContributor[];
}

export interface ReadinessBand {
  label: string;
  /** Tailwind text-colour token. */
  accent: string;
  /** CSS colour for the gauge arc. */
  color: string;
}

const BASELINE_DAYS = 60;
const MIN_BASELINE = 14;
const SLEEP_TARGET_MIN = 480; // 8h
const WEIGHTS: Record<ReadinessContributor["key"], number> = {
  hrv: 0.35,
  rhr: 0.25,
  sleep: 0.3,
  load: 0.1,
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values: number[], mu: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((a, b) => a + (b - mu) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Collect up to `BASELINE_DAYS` prior non-null values for a key. */
function baseline(metrics: DailyMetric[], index: number, key: keyof DailyMetric): number[] {
  const out: number[] = [];
  for (let i = index - 1; i >= 0 && out.length < BASELINE_DAYS; i--) {
    const v = metrics[i][key];
    if (v != null) out.push(v as number);
  }
  return out;
}

/** Map a z-score to 0..100; `dir` says which direction is favourable. */
function zScore(value: number, mu: number, sd: number, dir: "higher" | "lower"): number {
  if (sd === 0) return 50;
  const z = (value - mu) / sd;
  return clamp(50 + (dir === "higher" ? 1 : -1) * z * 15);
}

/**
 * Daily readiness (Oura/Whoop-style) from HRV and resting HR relative to each
 * person's own rolling baseline, sleep vs an 8h target, and the prior day's
 * training load. Expects metrics ordered chronologically (ascending).
 */
export function computeReadiness(metrics: DailyMetric[]): ReadinessDay[] {
  return metrics.map((row, i): ReadinessDay => {
    const contributors: ReadinessContributor[] = [];

    if (row.hrv_ms != null) {
      const base = baseline(metrics, i, "hrv_ms");
      if (base.length >= MIN_BASELINE) {
        const mu = mean(base);
        contributors.push({
          key: "hrv",
          label: "HRV",
          score: zScore(row.hrv_ms, mu, std(base, mu), "higher"),
        });
      }
    }

    if (row.resting_hr != null) {
      const base = baseline(metrics, i, "resting_hr");
      if (base.length >= MIN_BASELINE) {
        const mu = mean(base);
        contributors.push({
          key: "rhr",
          label: "Resting HR",
          score: zScore(row.resting_hr, mu, std(base, mu), "lower"),
        });
      }
    }

    if (row.sleep_min != null) {
      contributors.push({
        key: "sleep",
        label: "Sleep",
        score: clamp((row.sleep_min / SLEEP_TARGET_MIN) * 100),
      });
    }

    // Prior-day training load: a hard day yesterday costs a little readiness.
    const prev = metrics[i - 1];
    if (prev?.exercise_min != null) {
      const base = baseline(metrics, i, "exercise_min");
      const mu = base.length >= MIN_BASELINE ? mean(base) : 30;
      const over = Math.max(0, prev.exercise_min - mu);
      contributors.push({ key: "load", label: "Recovery", score: clamp(100 - (over / 60) * 30, 40) });
    }

    if (!contributors.length) return { date: row.date, score: null, contributors };

    let weighted = 0;
    let weightSum = 0;
    for (const c of contributors) {
      weighted += c.score * WEIGHTS[c.key];
      weightSum += WEIGHTS[c.key];
    }

    return {
      date: row.date,
      score: Math.round(weighted / weightSum),
      contributors,
    };
  });
}

export function readinessBand(score: number): ReadinessBand {
  if (score >= 85) return { label: "Primed", accent: "text-chart-1", color: "var(--chart-1)" };
  if (score >= 70) return { label: "Ready", accent: "text-chart-2", color: "var(--chart-2)" };
  if (score >= 55) return { label: "Moderate", accent: "text-chart-3", color: "var(--chart-3)" };
  return { label: "Take it easy", accent: "text-chart-4", color: "var(--chart-4)" };
}
