/**
 * Build a single-element segmented bar via a hard-stop linear gradient. Avoids
 * the hairline anti-alias seams you get between fractional-width flex children,
 * and keeps every segment perfectly flush and full-height. Returns undefined
 * when there's nothing to show so callers can fall back to a muted track.
 *
 * Shared by the composition bars on the Sleep, Activity, Body and Nutrition
 * dashboards.
 */
export function barGradient(parts: Array<{ pct: number; color: string }>): string | undefined {
  const visible = parts.filter((p) => p.pct > 0);
  if (!visible.length) return undefined;
  let acc = 0;
  const stops = visible.map((p) => {
    const stop = `${p.color} ${acc}% ${acc + p.pct}%`;
    acc += p.pct;
    return stop;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
