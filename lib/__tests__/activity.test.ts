import { describe, expect, it } from "vitest";
import { energyComposition, weekdayAverages } from "../activity";
import type { DailyMetric } from "@/lib/queries/metrics";

/** Build a daily_metrics row; only the fields under test need supplying. */
function day(over: Partial<DailyMetric> = {}): DailyMetric {
  return { date: "2024-01-01", ...over } as DailyMetric;
}

describe("weekdayAverages", () => {
  it("groups a numeric metric by local weekday, Mon-first", () => {
    const metrics = [
      day({ date: "2024-01-01", steps: 100 }), // Monday
      day({ date: "2024-01-08", steps: 200 }), // Monday
      day({ date: "2024-01-06", steps: 50 }), //  Saturday
    ];
    const wk = weekdayAverages(metrics, "steps");
    expect(wk.map((w) => w.day)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(wk[0]).toMatchObject({ day: "Mon", value: 150, days: 2 });
    expect(wk[5]).toMatchObject({ day: "Sat", value: 50, days: 1 });
    expect(wk[1]).toMatchObject({ day: "Tue", value: null, days: 0 });
  });

  it("skips null / non-finite values", () => {
    const metrics = [
      day({ date: "2024-01-01", steps: null }),
      day({ date: "2024-01-08", steps: 300 }),
    ];
    const wk = weekdayAverages(metrics, "steps");
    expect(wk[0]).toMatchObject({ value: 300, days: 1 });
  });

  it("returns all-null buckets for no data", () => {
    const wk = weekdayAverages([], "steps");
    expect(wk).toHaveLength(7);
    expect(wk.every((w) => w.value === null && w.days === 0)).toBe(true);
  });
});

describe("energyComposition", () => {
  it("splits the average day into resting and active kcal", () => {
    const metrics = [
      day({ active_energy: 400, basal_energy: 1600 }),
      day({ active_energy: 600, basal_energy: 1400 }),
    ];
    const { parts, totalKcal, hasResting } = energyComposition(metrics);
    expect(hasResting).toBe(true);
    expect(totalKcal).toBe(2000); // 500 active + 1500 resting
    const resting = parts.find((p) => p.key === "resting")!;
    const active = parts.find((p) => p.key === "active")!;
    expect(resting.avgKcal).toBe(1500);
    expect(active.avgKcal).toBe(500);
    expect(resting.pct).toBe(75);
    expect(active.pct).toBe(25);
    // Resting is ordered first so a gradient bar reads base-then-active.
    expect(parts[0].key).toBe("resting");
  });

  it("flags missing resting data and attributes the whole bar to active", () => {
    const metrics = [day({ active_energy: 500, basal_energy: null })];
    const { parts, hasResting, totalKcal } = energyComposition(metrics);
    expect(hasResting).toBe(false);
    expect(totalKcal).toBe(500);
    expect(parts.find((p) => p.key === "active")!.pct).toBe(100);
    expect(parts.find((p) => p.key === "resting")!.pct).toBe(0);
  });

  it("handles no data without dividing by zero", () => {
    const { parts, totalKcal } = energyComposition([]);
    expect(totalKcal).toBe(0);
    expect(parts.every((p) => p.pct === 0 && p.avgKcal === 0)).toBe(true);
  });
});
