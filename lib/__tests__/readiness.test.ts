import { describe, expect, it } from "vitest";
import { computeReadiness, readinessBand } from "@/lib/health/readiness";
import type { DailyMetric } from "@/lib/queries/metrics";

const mk = (date: string, fields: Partial<DailyMetric>): DailyMetric =>
  ({ date, ...fields }) as unknown as DailyMetric;

/** 40 baseline days (with a little variance) then a great day and an awful day. */
function buildSeries(): DailyMetric[] {
  const rows: DailyMetric[] = [];
  for (let i = 0; i < 40; i++) {
    rows.push(
      mk(new Date(2024, 0, 1 + i).toISOString().slice(0, 10), {
        hrv_ms: i % 2 ? 52 : 48,
        resting_hr: i % 2 ? 62 : 58,
        sleep_min: i % 2 ? 490 : 470,
        exercise_min: 30,
      }),
    );
  }
  rows.push(mk("2024-02-10", { hrv_ms: 72, resting_hr: 52, sleep_min: 480, exercise_min: 30 }));
  rows.push(mk("2024-02-11", { hrv_ms: 34, resting_hr: 72, sleep_min: 300, exercise_min: 30 }));
  return rows;
}

describe("computeReadiness", () => {
  it("scores a recovered day far higher than a depleted one", () => {
    const days = computeReadiness(buildSeries());
    const good = days[40];
    const bad = days[41];
    expect(good.score).not.toBeNull();
    expect(bad.score).not.toBeNull();
    expect(good.score!).toBeGreaterThan(bad.score!);
    expect(good.score!).toBeGreaterThan(80);
    expect(bad.score!).toBeLessThan(50);
    expect(good.contributors.map((c) => c.key).sort()).toEqual(["hrv", "load", "rhr", "sleep"]);
    for (const c of good.contributors) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    }
  });

  it("still scores early days from sleep before a baseline exists", () => {
    const days = computeReadiness(buildSeries());
    const first = days[0];
    expect(first.score).not.toBeNull();
    // No prior baseline yet, so HRV/RHR can't be z-scored on day 0.
    expect(first.contributors.map((c) => c.key)).toContain("sleep");
    expect(first.contributors.map((c) => c.key)).not.toContain("hrv");
  });

  it("returns a null score for a day with no usable metrics", () => {
    const days = computeReadiness([mk("2024-01-01", {})]);
    expect(days[0].score).toBeNull();
    expect(days[0].contributors).toEqual([]);
  });
});

describe("readinessBand", () => {
  it("labels the score bands", () => {
    expect(readinessBand(90).label).toBe("Primed");
    expect(readinessBand(75).label).toBe("Ready");
    expect(readinessBand(60).label).toBe("Moderate");
    expect(readinessBand(40).label).toBe("Take it easy");
  });
});
