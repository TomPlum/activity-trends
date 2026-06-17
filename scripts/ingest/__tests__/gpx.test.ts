import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseGpx } from "../gpx";

const xml = readFileSync(join(__dirname, "fixtures/example-route.gpx"), "utf8");

describe("parseGpx", () => {
  const route = parseGpx(xml);

  it("extracts [lon, lat] points in order", () => {
    expect(route.points.length).toBe(2);
    expect(route.points[0]).toEqual([-2.538323, 53.252917]);
  });

  it("computes bounds [w, s, e, n]", () => {
    expect(route.bounds).not.toBeNull();
    const [w, s, e, n] = route.bounds!;
    expect(w).toBeLessThanOrEqual(e);
    expect(s).toBeLessThanOrEqual(n);
  });

  it("uses the metadata time as start", () => {
    expect(route.startTime).toBe("2020-08-23T17:40:02Z");
  });

  it("computes a non-negative distance", () => {
    expect(route.distanceKm).toBeGreaterThanOrEqual(0);
  });
});
