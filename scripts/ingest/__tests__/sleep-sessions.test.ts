import { describe, expect, it } from "vitest";
import { buildSleepSessions } from "../sleep-sessions";
import type { SleepSegment } from "../health-export";

function seg(value: string, start: string, end: string): SleepSegment {
  return { value, start_time: start, end_time: end, wake_day: end.slice(0, 10), source: "watch" };
}

describe("buildSleepSessions", () => {
  it("groups contiguous segments into one night and sums stages", () => {
    const segments = [
      seg("HKCategoryValueSleepAnalysisAsleepCore", "2024-01-01T23:00:00Z", "2024-01-01T23:30:00Z"),
      seg("HKCategoryValueSleepAnalysisAsleepDeep", "2024-01-01T23:30:00Z", "2024-01-02T00:30:00Z"),
      seg("HKCategoryValueSleepAnalysisAsleepREM", "2024-01-02T00:30:00Z", "2024-01-02T01:00:00Z"),
      seg("HKCategoryValueSleepAnalysisAwake", "2024-01-02T01:00:00Z", "2024-01-02T01:10:00Z"),
    ];
    const { sessions, daily } = buildSleepSessions(segments);
    expect(sessions).toHaveLength(1);
    const s = sessions[0];
    expect(s.deep_min).toBe(60);
    expect(s.rem_min).toBe(30);
    expect(s.light_min).toBe(30); // Core -> light
    expect(s.awake_min).toBe(10);
    expect(s.duration_min).toBe(120); // asleep = deep+rem+light
    expect(s.quality_pct).toBeGreaterThan(0);
    expect(daily[0]).toMatchObject({ date: "2024-01-02", sleep_min: 120 });
  });

  it("splits sessions separated by a long gap", () => {
    const segments = [
      seg("HKCategoryValueSleepAnalysisAsleepCore", "2024-01-01T23:00:00Z", "2024-01-02T06:00:00Z"),
      // afternoon nap, hours later
      seg("HKCategoryValueSleepAnalysisAsleepCore", "2024-01-02T14:00:00Z", "2024-01-02T14:40:00Z"),
    ];
    const { sessions } = buildSleepSessions(segments);
    expect(sessions).toHaveLength(2);
    expect(sessions[1].is_nap).toBe(true);
  });

  it("ignores in-bed-only groups with no real sleep", () => {
    const segments = [
      seg("HKCategoryValueSleepAnalysisInBed", "2024-01-01T23:00:00Z", "2024-01-02T07:00:00Z"),
    ];
    expect(buildSleepSessions(segments).sessions).toHaveLength(0);
  });
});
