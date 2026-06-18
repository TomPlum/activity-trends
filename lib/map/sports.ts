// Per-sport route colours for the "by sport" map view. These are baked hex
// values (not CSS vars) because maplibre paints to a canvas and can't resolve
// CSS custom properties. Chosen to stay legible over both the light and dark
// CARTO basemaps.
const SPORT_COLORS: Record<string, string> = {
  Running: "#f97316",
  Walking: "#22d3ee",
  Cycling: "#a855f7",
  Hiking: "#22c55e",
  Swimming: "#3b82f6",
  Rowing: "#14b8a6",
  Elliptical: "#eab308",
};

export const OTHER_SPORT_COLOR = "#94a3b8";

export function sportColor(activityType: string): string {
  return SPORT_COLORS[activityType] ?? OTHER_SPORT_COLOR;
}
