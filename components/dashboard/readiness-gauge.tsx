"use client";

import { motion } from "motion/react";
import { readinessBand } from "@/lib/health/readiness";
import { cn } from "@/lib/utils";

/** 270° radial gauge for a 0..100 readiness score. */
export function ReadinessGauge({ score, size = 168 }: { score: number | null; size?: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const arcLen = circumference * 0.75; // 270° track, gap at the bottom
  const pct = score == null ? 0 : Math.max(0, Math.min(score, 100)) / 100;
  const band = score == null ? null : readinessBand(score);
  const color = band?.color ?? "var(--muted-foreground)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <g transform="rotate(135 60 60)">
          <circle
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
          />
          <motion.circle
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
            initial={{ strokeDashoffset: arcLen }}
            animate={{ strokeDashoffset: arcLen * (1 - pct) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums leading-none">{score ?? "—"}</span>
        <span className={cn("mt-1.5 text-xs font-medium", band?.accent ?? "text-muted-foreground")}>
          {band?.label ?? "No data"}
        </span>
      </div>
    </div>
  );
}
