import { describe, expect, it } from "vitest";
import {
  ageFromDob,
  expectedVo2,
  fitnessAge,
  normaliseSex,
  restingHrRating,
  vo2Rating,
} from "@/lib/health/fitness";
import { buildRecords, type RecordWorkout } from "@/lib/health/records";

describe("fitness age & ratings", () => {
  it("normalises sex from Apple's strings", () => {
    expect(normaliseSex("HKBiologicalSexFemale")).toBe("female");
    expect(normaliseSex("Female")).toBe("female");
    expect(normaliseSex("Male")).toBe("male");
    expect(normaliseSex(null)).toBe("male");
  });

  it("computes age from a date of birth", () => {
    const now = new Date(2026, 5, 18); // 18 Jun 2026
    expect(ageFromDob("1997-03-02", now)).toBe(29);
    expect(ageFromDob("1997-12-25", now)).toBe(28); // birthday not yet reached
  });

  it("returns a younger fitness age for above-median VO₂ max", () => {
    // A 45yo male median is ~39; someone at 48 should read much younger.
    const fa = fitnessAge(48, "male");
    expect(fa).toBeLessThanOrEqual(25);
  });

  it("returns an older fitness age for below-median VO₂ max", () => {
    const fa = fitnessAge(31, "male"); // ~65yo male median
    expect(fa).toBeGreaterThanOrEqual(60);
  });

  it("rates VO₂ max relative to the age/sex median", () => {
    expect(vo2Rating(expectedVo2(40, "male") * 1.2, 40, "male").label).toBe("Superior");
    expect(vo2Rating(expectedVo2(40, "male") * 0.7, 40, "male").label).toBe("Below average");
  });

  it("rates resting heart rate", () => {
    expect(restingHrRating(45).label).toBe("Athlete");
    expect(restingHrRating(60).label).toBe("Good");
    expect(restingHrRating(80).label).toBe("Elevated");
  });
});

describe("buildRecords", () => {
  const workouts: RecordWorkout[] = [
    { activity_type: "Running", distance_km: 10, duration_min: 60, energy_kcal: 600, start_time: "2024-03-01T08:00:00Z" },
    { activity_type: "Running", distance_km: 5, duration_min: 25, energy_kcal: 350, start_time: "2024-04-01T08:00:00Z" }, // 5:00/km — fastest
    { activity_type: "Cycling", distance_km: 40, duration_min: 90, energy_kcal: 800, start_time: "2024-05-01T08:00:00Z" }, // longest + biggest burn
  ];

  it("picks longest distance, fastest pace and biggest burn correctly", () => {
    const recs = buildRecords(workouts, {});
    const byKey = Object.fromEntries(recs.map((r) => [r.key, r]));
    expect(byKey["longest-distance"].detail).toContain("Cycling");
    expect(byKey["biggest-burn"].value).toContain("800");
    expect(byKey["fastest-pace"].detail).toContain("Running");
    expect(byKey["fastest-pace"].value).toContain("5:00");
  });

  it("emits daily-peak records only when present", () => {
    const recs = buildRecords([], { steps: { date: "2024-02-02", value: 28000 } });
    expect(recs.map((r) => r.key)).toEqual(["most-steps"]);
    expect(recs[0].value).toBe("28,000");
  });
});
