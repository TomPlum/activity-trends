"use client";

import { motion } from "motion/react";

interface RingDef {
  value: number;
  goal: number;
  color: string;
  label: string;
}

function Ring({
  ring,
  radius,
  stroke,
  delay,
}: {
  ring: RingDef;
  radius: number;
  stroke: number;
  delay: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const pct = ring.goal > 0 ? Math.min(ring.value / ring.goal, 1) : 0;
  return (
    <g transform="rotate(-90 60 60)">
      <circle
        cx={60}
        cy={60}
        r={radius}
        fill="none"
        stroke={ring.color}
        strokeWidth={stroke}
        strokeOpacity={0.18}
      />
      <motion.circle
        cx={60}
        cy={60}
        r={radius}
        fill="none"
        stroke={ring.color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - pct) }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </g>
  );
}

export function ActivityRings({
  move,
  exercise,
  stand,
  size = 120,
}: {
  move: { value: number; goal: number };
  exercise: { value: number; goal: number };
  stand: { value: number; goal: number };
  size?: number;
}) {
  const rings: RingDef[] = [
    { ...move, color: "var(--chart-4)", label: "Move" },
    { ...exercise, color: "var(--chart-1)", label: "Exercise" },
    { ...stand, color: "var(--chart-2)", label: "Stand" },
  ];
  const stroke = 11;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-label="Apple activity rings">
      <Ring ring={rings[0]} radius={50} stroke={stroke} delay={0} />
      <Ring ring={rings[1]} radius={37} stroke={stroke} delay={0.12} />
      <Ring ring={rings[2]} radius={24} stroke={stroke} delay={0.24} />
    </svg>
  );
}
