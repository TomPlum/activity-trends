"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Counts a pre-formatted stat string up to its value on mount and tweens to a
 * new target whenever the string changes (e.g. when the range filter updates).
 *
 * Works on already-formatted strings ("16,007", "266.5k", "6h 39m", "88.2 km")
 * by splitting them into numeric runs and literal separators: each numeric run
 * is animated while its grouping, decimal places and surrounding text (units,
 * "k"/"M" suffixes, "h"/"m" labels) are preserved exactly. Non-numeric values
 * such as the "—" placeholder pass through unchanged.
 */

interface Token {
  kind: "num" | "text";
  text: string;
  target: number;
  decimals: number;
  grouped: boolean;
}

const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/g;

function parse(value: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  NUMBER_RE.lastIndex = 0;
  while ((match = NUMBER_RE.exec(value))) {
    if (match.index > last) {
      tokens.push({ kind: "text", text: value.slice(last, match.index), target: 0, decimals: 0, grouped: false });
    }
    const raw = match[0];
    tokens.push({
      kind: "num",
      text: raw,
      target: parseFloat(raw.replace(/,/g, "")),
      decimals: (raw.split(".")[1] ?? "").length,
      grouped: raw.includes(","),
    });
    last = match.index + raw.length;
  }
  if (last < value.length) {
    tokens.push({ kind: "text", text: value.slice(last), target: 0, decimals: 0, grouped: false });
  }
  return tokens;
}

function formatNum(value: number, decimals: number, grouped: boolean): string {
  if (grouped) {
    return new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return value.toFixed(decimals);
}

/** Rebuild the display string with the numeric runs set to `values`. */
function build(tokens: Token[], values: number[]): string {
  let i = 0;
  let out = "";
  for (const token of tokens) {
    if (token.kind === "text") out += token.text;
    else out += formatNum(values[i++] ?? token.target, token.decimals, token.grouped);
  }
  return out;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedNumber({
  value,
  durationMs = 700,
}: {
  value: string;
  durationMs?: number;
}) {
  const tokens = useMemo(() => parse(value), [value]);
  const targets = useMemo(() => tokens.filter((t) => t.kind === "num").map((t) => t.target), [tokens]);

  // Where the next animation starts from — 0 on first mount, the previous
  // targets thereafter so filter changes tween between values rather than 0.
  const fromRef = useRef<number[]>(targets.map(() => 0));
  const [text, setText] = useState(() => build(tokens, fromRef.current));

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // No numbers, no motion preference, or a structural change in token count:
    // snap straight to the final value.
    if (reduced || targets.length === 0) {
      setText(build(tokens, targets));
      fromRef.current = targets;
      return;
    }
    const from =
      fromRef.current.length === targets.length ? fromRef.current : targets.map(() => 0);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      const current = targets.map((target, i) => from[i] + (target - from[i]) * eased);
      setText(build(tokens, current));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = targets;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `tokens`/`targets` are derived from `value`; keying off it is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return <>{text}</>;
}
