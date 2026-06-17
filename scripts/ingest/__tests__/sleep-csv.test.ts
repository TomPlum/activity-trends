import { describe, expect, it } from "vitest";
import { parseSleepCsv } from "../sleep-csv";

const CSV = `Start Time, End Time, Duration (mins), Nap, Sleep Quality (%), Time Awake (mins), Time in REM Sleep (mins), Time in Light Sleep (mins), Time In Deep Sleep (mins), Sounds Recorded, Wake-up mood
2020-08-01 22:40:21 +0000, (null), 0, NO, 0, 0, 0, 0, 0, 0, N/A
2018-08-16 22:16:57 +0000, 2018-08-17 05:36:42 +0000, 440, NO, 56, 90, 50, 170, 130, 65, Ok
2019-01-01 13:00:00 +0000, 2019-01-01 14:00:00 +0000, 60, YES, 80, 5, 10, 30, 15, 2, Good`;

describe("parseSleepCsv", () => {
  const rows = parseSleepCsv(CSV);

  it("parses each non-header line", () => {
    expect(rows).toHaveLength(3);
  });

  it("maps fields and handles (null) end time", () => {
    const r = rows[0];
    expect(r.start_time).toBe("2020-08-01T22:40:21.000Z");
    expect(r.end_time).toBeNull();
    expect(r.mood).toBe("N/A");
  });

  it("parses a full session", () => {
    const r = rows[1];
    expect(r.duration_min).toBe(440);
    expect(r.quality_pct).toBe(56);
    expect(r.deep_min).toBe(130);
    expect(r.is_nap).toBe(false);
  });

  it("detects naps", () => {
    expect(rows[2].is_nap).toBe(true);
  });
});
