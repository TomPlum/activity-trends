import { describe, expect, it } from "vitest";
import { bmiCategory, bmiScalePosition, bodyComposition } from "@/lib/health/body";

describe("bmiCategory", () => {
  it("classifies each WHO band", () => {
    expect(bmiCategory(17)?.key).toBe("underweight");
    expect(bmiCategory(22)?.key).toBe("normal");
    expect(bmiCategory(27)?.key).toBe("overweight");
    expect(bmiCategory(33)?.key).toBe("obese");
  });

  it("uses inclusive-lower / exclusive-upper boundaries", () => {
    expect(bmiCategory(18.5)?.key).toBe("normal");
    expect(bmiCategory(25)?.key).toBe("overweight");
    expect(bmiCategory(30)?.key).toBe("obese");
  });

  it("returns null for missing input", () => {
    expect(bmiCategory(null)).toBeNull();
    expect(bmiCategory(undefined)).toBeNull();
  });
});

describe("bmiScalePosition", () => {
  it("maps BMI onto a clamped 0–100 scale", () => {
    expect(bmiScalePosition(15)).toBe(0);
    expect(bmiScalePosition(40)).toBe(100);
    expect(bmiScalePosition(27.5)).toBeCloseTo(50, 5);
    expect(bmiScalePosition(5)).toBe(0); // clamped
    expect(bmiScalePosition(99)).toBe(100); // clamped
  });
});

describe("bodyComposition", () => {
  it("splits weight into lean and fat mass", () => {
    const comp = bodyComposition(80, 25)!;
    expect(comp.fatPct).toBe(25);
    const fat = comp.parts.find((p) => p.key === "fat")!;
    const lean = comp.parts.find((p) => p.key === "lean")!;
    expect(fat.kg).toBe(20);
    expect(lean.kg).toBe(60);
    expect(fat.pct).toBe(25);
    expect(lean.pct).toBe(75);
    // Lean is ordered first so a gradient bar reads lean-then-fat.
    expect(comp.parts[0].key).toBe("lean");
  });

  it("returns null when weight or body fat is missing", () => {
    expect(bodyComposition(80, null)).toBeNull();
    expect(bodyComposition(null, 25)).toBeNull();
  });
});
