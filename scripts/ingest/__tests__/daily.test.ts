import { describe, expect, it } from "vitest";
import { DailyAccumulator } from "../daily";

describe("DailyAccumulator", () => {
  it("sums sum-typed metrics per day", () => {
    const a = new DailyAccumulator();
    a.addRecord("2024-01-01", "StepCount", 1000);
    a.addRecord("2024-01-01", "StepCount", 2500);
    a.addRecord("2024-01-02", "StepCount", 500);
    const rows = a.finalize();
    const d1 = rows.find((r) => r.date === "2024-01-01");
    const d2 = rows.find((r) => r.date === "2024-01-02");
    expect(d1?.steps).toBe(3500);
    expect(d2?.steps).toBe(500);
  });

  it("averages avg-typed metrics", () => {
    const a = new DailyAccumulator();
    a.addRecord("2024-01-01", "HeartRate", 60);
    a.addRecord("2024-01-01", "HeartRate", 80);
    expect(a.finalize()[0].avg_heart_rate).toBe(70);
  });

  it("scales fractional percentages to 0–100", () => {
    const a = new DailyAccumulator();
    a.addRecord("2024-01-01", "OxygenSaturation", 0.97);
    expect(a.finalize()[0].blood_oxygen).toBe(97);
  });

  it("merges direct (ring/sleep) values", () => {
    const a = new DailyAccumulator();
    a.addRecord("2024-01-01", "StepCount", 100);
    a.setDirect("2024-01-01", "active_energy", 540);
    a.setDirect("2024-01-01", "sleep_min", 432);
    const row = a.finalize()[0];
    expect(row.active_energy).toBe(540);
    expect(row.sleep_min).toBe(432);
    expect(row.steps).toBe(100);
  });

  it("ignores null/unmapped values", () => {
    const a = new DailyAccumulator();
    a.addRecord("2024-01-01", "StepCount", null);
    a.addRecord("2024-01-01", "NotAThing", 5);
    expect(a.finalize()).toHaveLength(0);
  });

  describe("BMI derivation", () => {
    it("derives BMI from weight and height when Apple recorded none", () => {
      const a = new DailyAccumulator();
      a.addRecord("2024-01-01", "BodyMass", 80);
      a.setHeight("2024-01-01", 2); // 80 / 2² = 20
      const row = a.finalize().find((r) => r.date === "2024-01-01")!;
      expect(row.weight_kg).toBe(80);
      expect(row.bmi).toBe(20);
    });

    it("prefers a recorded BMI over the derived value", () => {
      const a = new DailyAccumulator();
      a.addRecord("2024-01-01", "BodyMass", 80);
      a.addRecord("2024-01-01", "BodyMassIndex", 25);
      a.setHeight("2024-01-01", 2); // would derive 20
      const row = a.finalize().find((r) => r.date === "2024-01-01")!;
      expect(row.bmi).toBe(25);
    });

    it("carries the most recent prior height forward to later days", () => {
      const a = new DailyAccumulator();
      a.setHeight("2024-01-01", 2);
      a.addRecord("2024-06-01", "BodyMass", 90); // no height logged that day
      const row = a.finalize().find((r) => r.date === "2024-06-01")!;
      expect(row.bmi).toBe(22.5); // 90 / 2²
    });

    it("leaves BMI null when no height is known", () => {
      const a = new DailyAccumulator();
      a.addRecord("2024-01-01", "BodyMass", 80);
      const row = a.finalize().find((r) => r.date === "2024-01-01")!;
      expect(row.bmi == null).toBe(true);
    });
  });
});
