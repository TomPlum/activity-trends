import { describe, expect, it } from "vitest";
import { parseEcgCsv } from "../ecg-csv";

// Mirrors the Japanese-locale layout of a real Apple ECG export.
const JA_CSV = `名前,Tom Plumpton
生年月日,"02/03/1997"
記録日,2019-06-04 15:15:39 +0100
分類,洞調律
症状,
ソフトウェアバージョン,1.13
デバイス,"Watch4,2"
サンプルレート,513.406ヘルツ


リード,リードI
単位,µV

-233.043
-323.883
120.5`;

describe("parseEcgCsv", () => {
  const ecg = parseEcgCsv(JA_CSV);

  it("parses the recording timestamp", () => {
    expect(ecg.recorded_at).toBe("2019-06-04T14:15:39.000Z");
  });

  it("translates the classification", () => {
    expect(ecg.classification).toBe("Sinus Rhythm");
  });

  it("parses sample rate and unit", () => {
    expect(ecg.sample_rate_hz).toBeCloseTo(513.406, 2);
    expect(ecg.unit).toBe("µV");
  });

  it("collects the waveform samples", () => {
    expect(ecg.sample_count).toBe(3);
    expect(ecg.samples).toEqual([-233.043, -323.883, 120.5]);
  });
});
