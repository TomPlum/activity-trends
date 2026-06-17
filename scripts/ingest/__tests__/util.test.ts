import { describe, expect, it } from "vitest";
import {
  haversineKm,
  normaliseHumidity,
  parseHealthDate,
  parseLeadingNumber,
  shortRecordType,
  toCelsius,
} from "../util";

describe("parseHealthDate", () => {
  it("parses HealthKit timestamps with an offset", () => {
    expect(parseHealthDate("2017-10-02 19:54:13 +0100")).toBe("2017-10-02T18:54:13.000Z");
  });
  it("handles +0000", () => {
    expect(parseHealthDate("2018-08-16 22:16:57 +0000")).toBe("2018-08-16T22:16:57.000Z");
  });
  it("returns null for junk", () => {
    expect(parseHealthDate("(null)")).toBeNull();
    expect(parseHealthDate("")).toBeNull();
    expect(parseHealthDate(null)).toBeNull();
  });
});

describe("parseLeadingNumber", () => {
  it("extracts the leading float", () => {
    expect(parseLeadingNumber("53 degF")).toBe(53);
    expect(parseLeadingNumber("8300 %")).toBe(8300);
    expect(parseLeadingNumber("16.36445068319638")).toBeCloseTo(16.3644, 3);
    expect(parseLeadingNumber("-2.5")).toBe(-2.5);
  });
  it("returns null when absent", () => {
    expect(parseLeadingNumber("abc")).toBeNull();
    expect(parseLeadingNumber(null)).toBeNull();
  });
});

describe("toCelsius", () => {
  it("converts fahrenheit", () => {
    expect(toCelsius(53, "53 degF")).toBeCloseTo(11.67, 2);
  });
  it("passes celsius through", () => {
    expect(toCelsius(20, "20 degC")).toBe(20);
  });
});

describe("normaliseHumidity", () => {
  it("scales down oversized values", () => {
    expect(normaliseHumidity(8300)).toBe(83);
    expect(normaliseHumidity(55)).toBe(55);
    expect(normaliseHumidity(null)).toBeNull();
  });
});

describe("shortRecordType", () => {
  it("strips known prefixes", () => {
    expect(shortRecordType("HKQuantityTypeIdentifierStepCount")).toBe("StepCount");
    expect(shortRecordType("HKCategoryTypeIdentifierSleepAnalysis")).toBe("SleepAnalysis");
  });
});

describe("haversineKm", () => {
  it("measures a short distance", () => {
    const d = haversineKm([-2.538252, 53.252968], [-2.538253, 53.252965]);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(0.01);
  });
});
