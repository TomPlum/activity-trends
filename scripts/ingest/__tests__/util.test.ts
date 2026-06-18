import { describe, expect, it } from "vitest";
import {
  haversineKm,
  heightToMeters,
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

describe("heightToMeters", () => {
  it("normalises the common Apple Health units to metres", () => {
    expect(heightToMeters(180, "cm")).toBeCloseTo(1.8, 5);
    expect(heightToMeters(1.8, "m")).toBeCloseTo(1.8, 5);
    expect(heightToMeters(6, "ft")).toBeCloseTo(1.8288, 4);
    expect(heightToMeters(72, "in")).toBeCloseTo(1.8288, 4);
  });
  it("infers cm vs m from magnitude when the unit is absent", () => {
    expect(heightToMeters(180, undefined)).toBeCloseTo(1.8, 5);
    expect(heightToMeters(1.8, undefined)).toBeCloseTo(1.8, 5);
  });
  it("rejects non-positive or invalid values", () => {
    expect(heightToMeters(0, "cm")).toBeNull();
    expect(heightToMeters(null, "cm")).toBeNull();
    expect(heightToMeters(Number.NaN, "cm")).toBeNull();
  });
});

describe("haversineKm", () => {
  it("measures a short distance", () => {
    const d = haversineKm([-2.538252, 53.252968], [-2.538253, 53.252965]);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(0.01);
  });
});
