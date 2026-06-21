/**
 * Pure helper for the Mobility dashboard: classifying an Apple "walking
 * steadiness" percentage into its OK / Low / Very Low bands. Unit-tested.
 */

export interface SteadinessBand {
  key: "very_low" | "low" | "ok";
  label: string;
  /** Inclusive lower bound on the 0–100 steadiness scale. */
  min: number;
  /** Exclusive upper bound; the top band ends at 100 (inclusive via Infinity). */
  max: number;
  /** Tailwind text-colour token. */
  accent: string;
}

export const STEADINESS_BANDS: SteadinessBand[] = [
  { key: "very_low", label: "Very low", min: 0, max: 30, accent: "text-rose-500" },
  { key: "low", label: "Low", min: 30, max: 50, accent: "text-amber-500" },
  { key: "ok", label: "OK", min: 50, max: Infinity, accent: "text-emerald-500" },
];

/** The band a steadiness percentage falls into, or null when unavailable. */
export function steadinessRating(pct: number | null | undefined): SteadinessBand | null {
  if (pct == null || !Number.isFinite(pct)) return null;
  return STEADINESS_BANDS.find((b) => pct >= b.min && pct < b.max) ?? null;
}
