/**
 * Pure helper for the Hearing dashboard: classifying an average sound-exposure
 * level (in decibels) against public-health guidance. The WHO suggests keeping
 * sustained exposure below ~70 dB; NIOSH treats 85 dB as the action level above
 * which prolonged exposure risks hearing loss. Unit-tested.
 */

export interface ExposureBand {
  key: "safe" | "elevated" | "high";
  label: string;
  /** Inclusive lower bound in dB. */
  min: number;
  /** Exclusive upper bound in dB; the top band is open-ended (Infinity). */
  max: number;
  /** Tailwind text-colour token. */
  accent: string;
}

export const EXPOSURE_BANDS: ExposureBand[] = [
  { key: "safe", label: "Safe", min: 0, max: 70, accent: "text-emerald-500" },
  { key: "elevated", label: "Elevated", min: 70, max: 85, accent: "text-amber-500" },
  { key: "high", label: "High", min: 85, max: Infinity, accent: "text-rose-500" },
];

/** The exposure band a decibel level falls into, or null when unavailable. */
export function exposureRating(db: number | null | undefined): ExposureBand | null {
  if (db == null || !Number.isFinite(db)) return null;
  return EXPOSURE_BANDS.find((b) => db >= b.min && db < b.max) ?? null;
}

/**
 * Position of a dB level along a fixed 40–100 dB visual scale, as a 0–100
 * percentage (clamped). Used to place a marker on the band strip.
 */
export function dbScalePosition(db: number, lo = 40, hi = 100): number {
  return Math.max(0, Math.min(100, ((db - lo) / (hi - lo)) * 100));
}
