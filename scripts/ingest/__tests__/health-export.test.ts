import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  streamHealthExport,
  type ActivitySummaryRow,
  type ProfileRow,
  type RecordRow,
  type WorkoutRow,
} from "../health-export";

async function run() {
  const workouts: WorkoutRow[] = [];
  const records: RecordRow[] = [];
  const summaries: ActivitySummaryRow[] = [];
  const captured: { profile: ProfileRow | null } = { profile: null };

  const counts = await streamHealthExport(
    join(__dirname, "fixtures/example-health-export.xml"),
    {
      onProfile: (p) => {
        captured.profile = p;
      },
      onWorkouts: async (rows) => {
        workouts.push(...rows);
      },
      onRecords: async (rows) => {
        records.push(...rows);
      },
      onActivitySummaries: async (rows) => {
        summaries.push(...rows);
      },
    },
    { batchSize: 2 },
  );

  return { counts, workouts, records, summaries, profile: captured.profile };
}

describe("streamHealthExport", () => {
  it("parses the workout with weather + timezone metadata", async () => {
    const { workouts, counts } = await run();
    expect(counts.workouts).toBe(1);
    const w = workouts[0];
    expect(w.activity_type).toBe("Elliptical");
    expect(w.start_time).toBe("2017-10-02T18:54:13.000Z");
    expect(w.energy_kcal).toBeCloseTo(177.234, 2);
    expect(w.timezone).toBe("Europe/London");
    expect(w.temperature_c).toBeCloseTo(11.7, 1);
    expect(w.humidity).toBe(83);
  });

  it("keeps only allowlisted record types", async () => {
    const { records } = await run();
    const types = records.map((r) => r.type).sort();
    // DietaryWater is excluded; Height, BodyMass, HeartRate are kept.
    expect(types).toEqual(["BodyMass", "HeartRate", "Height"]);
    expect(records.find((r) => r.type === "BodyMass")?.value).toBeCloseTo(80.15, 1);
  });

  it("captures the profile from <Me>", async () => {
    const { profile } = await run();
    expect(profile).not.toBeNull();
    expect(profile?.date_of_birth).toBe("1997-03-02");
    expect(profile?.biological_sex).toBe("Male");
  });
});
