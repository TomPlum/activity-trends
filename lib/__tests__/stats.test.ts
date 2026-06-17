import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streakStats } from "@/lib/stats";

const days = (...ds: string[]) => new Set(ds);

describe("streakStats", () => {
  afterEach(() => vi.useRealTimers());

  it("returns zeros for an empty set", () => {
    expect(streakStats(new Set())).toEqual({ current: 0, longest: 0, activeDays: 0 });
  });

  it("reports total active days regardless of ordering or gaps", () => {
    expect(streakStats(days("2024-06-02", "2024-05-01", "2024-06-01")).activeDays).toBe(3);
  });

  describe("current streak (relative to today)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15, 10, 0, 0)); // local 2024-06-15
    });

    it("counts a run ending today, including today", () => {
      expect(streakStats(days("2024-06-13", "2024-06-14", "2024-06-15")).current).toBe(3);
    });

    it("tolerates a missing today and counts the run ending yesterday", () => {
      expect(streakStats(days("2024-06-12", "2024-06-13", "2024-06-14")).current).toBe(3);
    });

    it("is zero when neither today nor yesterday is active", () => {
      expect(streakStats(days("2024-06-10", "2024-06-11")).current).toBe(0);
    });

    it("stops at the first gap", () => {
      expect(
        streakStats(days("2024-06-15", "2024-06-14", "2024-06-12", "2024-06-11")).current,
      ).toBe(2);
    });

    it("counts a current streak spanning a DST transition", () => {
      vi.setSystemTime(new Date(2024, 2, 11, 10, 0, 0)); // 2024-03-11, day after US spring-forward
      expect(streakStats(days("2024-03-09", "2024-03-10", "2024-03-11")).current).toBe(3);
    });
  });

  describe("longest streak", () => {
    it("finds the longest consecutive run among several", () => {
      expect(
        streakStats(
          days(
            "2024-01-01",
            "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", // run of 4
            "2024-01-10", "2024-01-11", // run of 2
          ),
        ).longest,
      ).toBe(4);
    });

    it("treats isolated days as runs of 1", () => {
      expect(streakStats(days("2024-01-01", "2024-03-01", "2024-06-01")).longest).toBe(1);
    });

    it("counts across a month boundary", () => {
      expect(
        streakStats(days("2024-01-30", "2024-01-31", "2024-02-01", "2024-02-02")).longest,
      ).toBe(4);
    });

    it("counts across the Feb 29 leap day", () => {
      expect(streakStats(days("2024-02-28", "2024-02-29", "2024-03-01")).longest).toBe(3);
    });

    it("counts across a year boundary", () => {
      expect(streakStats(days("2023-12-31", "2024-01-01")).longest).toBe(2);
    });
  });
});
