import { describe, expect, it } from "vitest";
import { deriveInsights, pearson } from "@/lib/insights/engine";
import type { DailyMetric } from "@/lib/queries/metrics";

const mk = (date: string, fields: Partial<DailyMetric>): DailyMetric =>
  ({ date, ...fields }) as unknown as DailyMetric;

describe("pearson", () => {
  it("is +1 for a perfect positive relationship", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 5);
  });

  it("is -1 for a perfect negative relationship", () => {
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1, 5);
  });

  it("returns null when a series has no variance", () => {
    expect(pearson([1, 1, 1, 1], [2, 4, 6, 8])).toBeNull();
  });

  it("returns null below the minimum sample size", () => {
    expect(pearson([1, 2], [2, 4])).toBeNull();
  });
});

describe("deriveInsights", () => {
  it("surfaces a strong lagged sleep → resting-HR relationship as positive", () => {
    // 60 days alternating 6h/8h sleep; next-day resting HR is lower after more
    // sleep, so the (negative) correlation is the desirable direction.
    const metrics: DailyMetric[] = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date(2024, 0, 1 + i).toISOString().slice(0, 10);
      const longSleep = i % 2 === 0;
      metrics.push(
        mk(date, {
          sleep_min: longSleep ? 480 : 360,
          // resting HR depends on *previous* night's sleep
          resting_hr: i === 0 ? 66 : (i - 1) % 2 === 0 ? 60 : 70,
        }),
      );
    }

    const insights = deriveInsights(metrics);
    const sleepRhr = insights.find((i) => i.id === "sleep-rhr");
    expect(sleepRhr).toBeDefined();
    expect(sleepRhr!.sentiment).toBe("positive");
    expect(sleepRhr!.text).toContain("lower");
    expect(sleepRhr!.n).toBeGreaterThanOrEqual(20);
    expect(sleepRhr!.r).toBeLessThan(0);
  });

  it("ignores weak or under-sampled relationships", () => {
    // Only 10 days, random-ish — nothing should clear the thresholds.
    const metrics = Array.from({ length: 10 }, (_, i) =>
      mk(new Date(2024, 0, 1 + i).toISOString().slice(0, 10), {
        sleep_min: 400 + (i % 3) * 5,
        resting_hr: 62 + (i % 2),
      }),
    );
    expect(deriveInsights(metrics)).toHaveLength(0);
  });

  it("returns nothing for empty input", () => {
    expect(deriveInsights([])).toEqual([]);
  });
});
