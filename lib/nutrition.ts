/**
 * Pure helpers for the Nutrition dashboard: turning the average day's
 * macronutrient grams into a calorie split (the classic carbs/protein/fat
 * energy breakdown). Unit-tested.
 */
import { mean } from "@/lib/stats";
import type { DailyMetric } from "@/lib/queries/metrics";

/** Atwater energy factors — kcal per gram of each macronutrient. */
export const KCAL_PER_GRAM = { carbs: 4, protein: 4, fat: 9 } as const;

export interface MacroPart {
  key: "carbs" | "protein" | "fat";
  label: string;
  color: string;
  /** Mean grams per day. */
  grams: number;
  /** Mean kcal per day contributed by this macro. */
  kcal: number;
  /** Share of macro-derived calories, 0–100. */
  pct: number;
}

export interface MacroComposition {
  parts: MacroPart[];
  /** Mean total kcal per day from the three macros. */
  totalKcal: number;
  /** Whether any macronutrient grams were recorded. */
  hasMacros: boolean;
}

/**
 * Split the average day's logged macronutrients into their calorie
 * contributions. Order is carbs → protein → fat so a gradient bar matches the
 * stacked macros chart.
 */
export function macroComposition(metrics: DailyMetric[]): MacroComposition {
  const carbsG = mean(metrics.map((d) => d.carbs_g)) ?? 0;
  const proteinG = mean(metrics.map((d) => d.protein_g)) ?? 0;
  const fatG = mean(metrics.map((d) => d.fat_g)) ?? 0;
  const hasMacros = metrics.some((d) => d.carbs_g != null || d.protein_g != null || d.fat_g != null);

  const carbsK = carbsG * KCAL_PER_GRAM.carbs;
  const proteinK = proteinG * KCAL_PER_GRAM.protein;
  const fatK = fatG * KCAL_PER_GRAM.fat;
  const total = carbsK + proteinK + fatK;
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const parts: MacroPart[] = [
    { key: "carbs", label: "Carbs", color: "var(--chart-1)", grams: carbsG, kcal: carbsK, pct: pct(carbsK) },
    { key: "protein", label: "Protein", color: "var(--chart-4)", grams: proteinG, kcal: proteinK, pct: pct(proteinK) },
    { key: "fat", label: "Fat", color: "var(--chart-3)", grams: fatG, kcal: fatK, pct: pct(fatK) },
  ];
  return { parts, totalKcal: total, hasMacros };
}
