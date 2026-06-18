import type { StyleSpecification } from "maplibre-gl";

// CARTO basemaps mirror the app's light/dark themes and, like raw OSM, are free
// to use without an API key. Routes read far better over CARTO's muted tiles
// than over the busy default OSM raster.
const CARTO_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';

const CARTO_SUBDOMAINS = ["a", "b", "c", "d"] as const;

function cartoStyle(variant: "light_all" | "dark_all"): StyleSpecification {
  return {
    version: 8,
    sources: {
      carto: {
        type: "raster",
        // maplibre does not expand {s}, so list each subdomain explicitly.
        tiles: CARTO_SUBDOMAINS.map(
          (s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
        ),
        tileSize: 256,
        attribution: CARTO_ATTRIBUTION,
      },
    },
    layers: [{ id: "carto", type: "raster", source: "carto" }],
  };
}

export const BASEMAP_LIGHT = cartoStyle("light_all");
export const BASEMAP_DARK = cartoStyle("dark_all");

/** Pick the basemap matching the active next-themes value (defaults to dark). */
export function basemapFor(theme: string | undefined): StyleSpecification {
  return theme === "light" ? BASEMAP_LIGHT : BASEMAP_DARK;
}

export interface RouteColors {
  /** Wide, faint underlay; overlapping routes build into a heat-like glow. */
  glow: string;
  /** Crisp route line drawn over the glow. */
  line: string;
  /** Single-route emphasis colour (workout detail map). */
  single: string;
}

// High-contrast palettes per theme. On the dark basemap warm "fire" tones glow;
// on the light basemap a saturated crimson/teal reads cleanly over pale tiles.
const ROUTE_COLORS_DARK: RouteColors = {
  glow: "#f97316",
  line: "#fdba74",
  single: "#34d399",
};

const ROUTE_COLORS_LIGHT: RouteColors = {
  glow: "#db2777",
  line: "#e11d48",
  single: "#0d9488",
};

export function routeColorsFor(theme: string | undefined): RouteColors {
  return theme === "light" ? ROUTE_COLORS_LIGHT : ROUTE_COLORS_DARK;
}
