import { describe, expect, it } from "vitest";
import { macroComposition } from "../nutrition";
import type { DailyMetric } from "@/lib/queries/metrics";

function day(over: Partial<DailyMetric> = {}): DailyMetric {
  return { date: "2024-01-01", ...over } as DailyMetric;
}

describe("macroComposition", () => {
  it("splits average macros into calorie shares (4/4/9)", () => {
    const metrics = [day({ carbs_g: 200, protein_g: 100, fat_g: 50 })];
    const { parts, totalKcal, hasMacros } = macroComposition(metrics);
    expect(hasMacros).toBe(true);
    // 200*4 + 100*4 + 50*9 = 800 + 400 + 450 = 1650
    expect(totalKcal).toBe(1650);
    const carbs = parts.find((p) => p.key === "carbs")!;
    const fat = parts.find((p) => p.key === "fat")!;
    expect(carbs.kcal).toBe(800);
    expect(fat.kcal).toBe(450);
    expect(carbs.pct).toBeCloseTo((800 / 1650) * 100, 5);
    expect(parts[0].key).toBe("carbs"); // carbs ordered first
  });

  it("averages across days and flags missing data", () => {
    const metrics = [day({ carbs_g: 100 }), day({ carbs_g: 300 })];
    const { parts, hasMacros } = macroComposition(metrics);
    expect(hasMacros).toBe(true);
    expect(parts.find((p) => p.key === "carbs")!.grams).toBe(200); // (100+300)/2
  });

  it("handles no data without dividing by zero", () => {
    const { parts, totalKcal, hasMacros } = macroComposition([day()]);
    expect(hasMacros).toBe(false);
    expect(totalKcal).toBe(0);
    expect(parts.every((p) => p.pct === 0)).toBe(true);
  });
});
