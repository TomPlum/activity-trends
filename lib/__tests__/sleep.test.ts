import { describe, expect, it } from "vitest";
import {
  circularTimeStats,
  clockFromNoonHours,
  clockLabel,
  efficiencyPct,
  hoursSinceAnchorNoon,
  minutesIntoDay,
  stageBreakdown,
  weekdayAverages,
  type SleepLike,
} from "../sleep";

/** Local (no trailing Z) ISO so wall-clock getters are timezone-independent. */
const at = (s: string) => s;

function session(over: Partial<SleepLike> = {}): SleepLike {
  return {
    start_time: at("2024-06-01T23:00:00"),
    end_time: at("2024-06-02T07:00:00"),
    duration_min: 420,
    quality_pct: 90,
    awake_min: 30,
    rem_min: 90,
    light_min: 240,
    deep_min: 90,
    ...over,
  };
}

describe("minutesIntoDay / clockLabel", () => {
  it("reads local wall-clock minutes", () => {
    expect(minutesIntoDay(at("2024-06-01T23:30:00"))).toBe(23 * 60 + 30);
    expect(minutesIntoDay(at("2024-06-02T00:15:00"))).toBe(15);
  });

  it("formats and wraps minutes past midnight", () => {
    expect(clockLabel(23 * 60 + 34)).toBe("23:34");
    expect(clockLabel(5)).toBe("00:05");
    expect(clockLabel(1440)).toBe("00:00");
    expect(clockLabel(null)).toBe("—");
  });
});

describe("circularTimeStats", () => {
  it("averages across midnight rather than to noon", () => {
    const { mean } = circularTimeStats([23 * 60 + 30, 30]); // 23:30 & 00:30
    expect(mean).toBeCloseTo(0, 5); // midnight
  });

  it("a perfectly regular schedule has ~zero spread", () => {
    const { mean, stdev } = circularTimeStats([1380, 1380, 1380]);
    expect(mean).toBeCloseTo(1380, 5);
    expect(stdev).toBeCloseTo(0, 5);
  });

  it("returns nulls when empty", () => {
    expect(circularTimeStats([null, undefined])).toEqual({ mean: null, stdev: null });
  });
});

describe("efficiencyPct", () => {
  it("prefers the stored quality", () => {
    expect(efficiencyPct(session({ quality_pct: 88 }))).toBe(88);
  });

  it("falls back to asleep / in-bed", () => {
    expect(efficiencyPct(session({ quality_pct: null, duration_min: 450, awake_min: 50 }))).toBe(90);
  });

  it("is null with no time in bed", () => {
    expect(efficiencyPct(session({ quality_pct: null, duration_min: 0, awake_min: 0 }))).toBeNull();
  });
});

describe("hoursSinceAnchorNoon / clockFromNoonHours", () => {
  const anchor = at("2024-06-01T23:00:00");

  it("places an evening bedtime and morning wake on one axis", () => {
    expect(hoursSinceAnchorNoon(at("2024-06-01T23:00:00"), anchor)).toBeCloseTo(11);
    expect(hoursSinceAnchorNoon(at("2024-06-02T07:00:00"), anchor)).toBeCloseTo(19);
  });

  it("handles an after-midnight bedtime via its own anchor", () => {
    const lateAnchor = at("2024-06-02T01:00:00");
    expect(hoursSinceAnchorNoon(lateAnchor, lateAnchor)).toBeCloseTo(13);
  });

  it("round-trips back to a clock label", () => {
    expect(clockFromNoonHours(11)).toBe("23:00");
    expect(clockFromNoonHours(19)).toBe("07:00");
    expect(clockFromNoonHours(13)).toBe("01:00");
  });
});

describe("stageBreakdown", () => {
  it("averages each stage and shares sum to 100", () => {
    const { stages, totalMin } = stageBreakdown([
      session({ deep_min: 60, rem_min: 60, light_min: 240, awake_min: 40 }),
      session({ deep_min: 100, rem_min: 100, light_min: 200, awake_min: 0 }),
    ]);
    expect(totalMin).toBeCloseTo(80 + 80 + 220 + 20);
    const deep = stages.find((s) => s.key === "deep")!;
    expect(deep.avgMin).toBeCloseTo(80);
    expect(stages.reduce((s, x) => s + x.pct, 0)).toBeCloseTo(100);
  });

  it("is safe on an empty set", () => {
    const { stages, totalMin } = stageBreakdown([]);
    expect(totalMin).toBe(0);
    expect(stages.every((s) => s.pct === 0)).toBe(true);
  });
});

describe("weekdayAverages", () => {
  it("buckets nights Mon-first by the day they began", () => {
    // 2024-06-01 is a Saturday, 2024-06-03 a Monday.
    const rows = weekdayAverages([
      session({ start_time: at("2024-06-01T23:00:00"), duration_min: 480 }),
      session({ start_time: at("2024-06-03T23:00:00"), duration_min: 360 }),
      session({ start_time: at("2024-06-10T23:00:00"), duration_min: 420 }),
    ]);
    expect(rows[0]).toMatchObject({ day: "Mon", nights: 2 });
    expect(rows[0].hours).toBeCloseTo((6 + 7) / 2);
    expect(rows.find((r) => r.day === "Sat")!.hours).toBeCloseTo(8);
    expect(rows.find((r) => r.day === "Sun")!.hours).toBeNull();
  });
});
