import { describe, expect, it } from "vitest";
import { steadinessRating } from "@/lib/health/mobility";

describe("steadinessRating", () => {
  it("classifies each band", () => {
    expect(steadinessRating(10)?.key).toBe("very_low");
    expect(steadinessRating(40)?.key).toBe("low");
    expect(steadinessRating(80)?.key).toBe("ok");
  });

  it("uses inclusive-lower / exclusive-upper boundaries", () => {
    expect(steadinessRating(30)?.key).toBe("low");
    expect(steadinessRating(50)?.key).toBe("ok");
    expect(steadinessRating(100)?.key).toBe("ok");
  });

  it("returns null for missing input", () => {
    expect(steadinessRating(null)).toBeNull();
    expect(steadinessRating(undefined)).toBeNull();
  });
});
