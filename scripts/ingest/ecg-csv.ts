import { parseHealthDate, parseLeadingNumber } from "./util";

export interface EcgRecord {
  recorded_at: string | null;
  classification: string | null;
  symptoms: string | null;
  sample_rate_hz: number | null;
  device: string | null;
  software_version: string | null;
  unit: string | null;
  samples: number[];
  sample_count: number;
}

// Apple exports ECG CSVs in the device locale; match keys in EN + JA.
function classify(key: string): string | null {
  const k = key.trim();
  if (/記録日|recorded date|recording date/i.test(k)) return "recordedDate";
  if (/分類|classification/i.test(k)) return "classification";
  if (/症状|symptom/i.test(k)) return "symptoms";
  if (/ソフトウェア|software/i.test(k)) return "software";
  if (/デバイス|device/i.test(k)) return "device";
  if (/サンプルレート|sample rate/i.test(k)) return "sampleRate";
  if (/単位|unit/i.test(k)) return "unit";
  return null;
}

// Common Apple ECG classifications (JA -> EN); pass through anything unknown.
const CLASSIFICATIONS: Record<string, string> = {
  洞調律: "Sinus Rhythm",
  心房細動: "Atrial Fibrillation",
  判定不能: "Inconclusive",
  高心拍数: "High Heart Rate",
  低心拍数: "Low Heart Rate",
};

function unquote(v: string): string {
  return v.trim().replace(/^"(.*)"$/, "$1").trim();
}

export function parseEcgCsv(content: string): EcgRecord {
  const lines = content.split(/\r?\n/);
  const meta: Record<string, string> = {};
  const samples: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // A bare numeric line is a waveform sample.
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      samples.push(Number(trimmed));
      continue;
    }

    const comma = line.indexOf(",");
    if (comma === -1) continue;
    const canonical = classify(line.slice(0, comma));
    if (canonical) meta[canonical] = unquote(line.slice(comma + 1));
  }

  const rawClass = meta.classification ?? null;
  return {
    recorded_at: parseHealthDate(meta.recordedDate),
    classification: rawClass ? (CLASSIFICATIONS[rawClass] ?? rawClass) : null,
    symptoms: meta.symptoms || null,
    sample_rate_hz: parseLeadingNumber(meta.sampleRate),
    device: meta.device || null,
    software_version: meta.software || null,
    unit: meta.unit || null,
    samples,
    sample_count: samples.length,
  };
}
