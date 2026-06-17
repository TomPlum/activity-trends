"use client";

import { useMemo } from "react";

/**
 * Renders an ECG waveform as a single SVG path. Downsamples to keep the DOM
 * light, and draws the classic pink ECG grid behind the trace.
 */
export function EcgWaveform({
  samples,
  maxPoints = 2500,
  height = 240,
}: {
  samples: number[];
  maxPoints?: number;
  height?: number;
}) {
  const { path, viewW } = useMemo(() => {
    if (!samples.length) return { path: "", viewW: 1000 };

    const step = Math.max(1, Math.ceil(samples.length / maxPoints));
    const pts: number[] = [];
    for (let i = 0; i < samples.length; i += step) pts.push(samples[i]);

    let min = Infinity;
    let max = -Infinity;
    for (const v of pts) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min || 1;
    const w = pts.length;
    const h = 100;

    const d = pts
      .map((v, i) => {
        const x = (i / (w - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

    return { path: d, viewW: w };
  }, [samples, maxPoints]);

  if (!path) return null;

  return (
    <div
      className="w-full overflow-hidden rounded-xl border"
      style={{ height, background: "color-mix(in oklab, var(--chart-4) 6%, var(--card))" }}
    >
      <svg
        viewBox={`0 0 ${viewW} 100`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        role="img"
        aria-label="ECG waveform"
      >
        <defs>
          <pattern id="ecg-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M10 0 L0 0 0 10"
              fill="none"
              stroke="var(--chart-4)"
              strokeWidth="0.3"
              opacity="0.25"
            />
          </pattern>
        </defs>
        <rect width={viewW} height="100" fill="url(#ecg-grid)" />
        <path d={path} fill="none" stroke="var(--chart-4)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
