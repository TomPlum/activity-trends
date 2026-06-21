import { describe, expect, it } from "vitest";
import { dbScalePosition, exposureRating } from "@/lib/health/hearing";

describe("exposureRating", () => {
  it("classifies each band", () => {
    expect(exposureRating(55)?.key).toBe("safe");
    expect(exposureRating(78)?.key).toBe("elevated");
    expect(exposureRating(92)?.key).toBe("high");
  });

  it("uses inclusive-lower / exclusive-upper boundaries", () => {
    expect(exposureRating(70)?.key).toBe("elevated");
    expect(exposureRating(85)?.key).toBe("high");
  });

  it("returns null for missing input", () => {
    expect(exposureRating(null)).toBeNull();
    expect(exposureRating(undefined)).toBeNull();
  });
});

describe("dbScalePosition", () => {
  it("maps dB onto a clamped 0–100 scale", () => {
    expect(dbScalePosition(40)).toBe(0);
    expect(dbScalePosition(100)).toBe(100);
    expect(dbScalePosition(70)).toBeCloseTo(50, 5);
    expect(dbScalePosition(20)).toBe(0); // clamped
    expect(dbScalePosition(120)).toBe(100); // clamped
  });
});
