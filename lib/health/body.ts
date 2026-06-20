/**
 * Pure helpers for the Body dashboard: classifying a BMI into the WHO weight
 * bands, and splitting body weight into lean vs fat mass. All unit-tested.
 */

export interface BmiBand {
  key: "underweight" | "normal" | "overweight" | "obese";
  label: string;
  /** Inclusive lower bound; the first band starts at 0. */
  min: number;
  /** Exclusive upper bound; the last band is open-ended (Infinity). */
  max: number;
  /** Tailwind text-colour token. */
  accent: string;
}

export const BMI_BANDS: BmiBand[] = [
  { key: "underweight", label: "Underweight", min: 0, max: 18.5, accent: "text-amber-500" },
  { key: "normal", label: "Normal", min: 18.5, max: 25, accent: "text-emerald-500" },
  { key: "overweight", label: "Overweight", min: 25, max: 30, accent: "text-amber-500" },
  { key: "obese", label: "Obese", min: 30, max: Infinity, accent: "text-rose-500" },
];

/** The WHO band a BMI falls into, or null when no BMI is available. */
export function bmiCategory(bmi: number | null | undefined): BmiBand | null {
  if (bmi == null || !Number.isFinite(bmi)) return null;
  return BMI_BANDS.find((b) => bmi >= b.min && bmi < b.max) ?? null;
}

/**
 * Position of a BMI along a fixed 15–40 visual scale, as a 0–100 percentage
 * (clamped). Used to place a marker on the band strip.
 */
export function bmiScalePosition(bmi: number, lo = 15, hi = 40): number {
  return Math.max(0, Math.min(100, ((bmi - lo) / (hi - lo)) * 100));
}

export interface BodyPart {
  key: "lean" | "fat";
  label: string;
  color: string;
  kg: number;
  /** Share of body weight, 0–100. */
  pct: number;
}

export interface BodyComposition {
  parts: BodyPart[];
  fatPct: number;
}

/**
 * Split body weight into lean mass and fat mass from a weight + body-fat
 * percentage. Parts are ordered lean-then-fat so a gradient bar reads
 * lean-first. Returns null when either input is missing.
 */
export function bodyComposition(
  weightKg: number | null | undefined,
  bodyFatPct: number | null | undefined,
): BodyComposition | null {
  if (weightKg == null || !Number.isFinite(weightKg)) return null;
  if (bodyFatPct == null || !Number.isFinite(bodyFatPct)) return null;
  const fatKg = (weightKg * bodyFatPct) / 100;
  const leanKg = weightKg - fatKg;
  return {
    fatPct: bodyFatPct,
    parts: [
      { key: "lean", label: "Lean mass", color: "var(--chart-2)", kg: leanKg, pct: 100 - bodyFatPct },
      { key: "fat", label: "Fat mass", color: "var(--chart-4)", kg: fatKg, pct: bodyFatPct },
    ],
  };
}
