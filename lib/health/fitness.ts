export type Sex = "male" | "female";

export interface Rating {
  label: string;
  /** Tailwind text-colour token. */
  accent: string;
}

/**
 * Reference median VO₂ max (ml/kg/min) by age, derived from population norms
 * (Cooper Institute / ACSM-style tables). Used both to rate fitness and to
 * estimate a "fitness age".
 */
const VO2_MEDIANS: Record<Sex, Array<[age: number, median: number]>> = {
  male: [
    [25, 48],
    [35, 43],
    [45, 39],
    [55, 35],
    [65, 31],
    [75, 27],
  ],
  female: [
    [25, 38],
    [35, 34],
    [45, 31],
    [55, 28],
    [65, 25],
    [75, 22],
  ],
};

export function normaliseSex(value: string | null | undefined): Sex {
  return value?.toLowerCase().includes("female") ? "female" : "male";
}

export function ageFromDob(dob: string, now = new Date()): number {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/** Linear interpolation across a sorted [x, y] table, clamped at the ends. */
function interpolate(points: Array<[number, number]>, x: number): number {
  if (x <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

/** Expected median VO₂ max for an age + sex. */
export function expectedVo2(age: number, sex: Sex): number {
  return interpolate(VO2_MEDIANS[sex], age);
}

/**
 * Estimate "fitness age": the age at which the population median VO₂ max equals
 * this person's. Higher fitness → younger fitness age. Clamped to 20–80.
 */
export function fitnessAge(vo2: number, sex: Sex): number {
  const table = VO2_MEDIANS[sex];
  if (vo2 >= table[0][1]) return 20;
  const last = table[table.length - 1];
  if (vo2 <= last[1]) return 80;
  // medians decrease with age, so walk pairs and invert.
  for (let i = 0; i < table.length - 1; i++) {
    const [a0, m0] = table[i];
    const [a1, m1] = table[i + 1];
    if (vo2 <= m0 && vo2 >= m1) {
      const t = (m0 - vo2) / (m0 - m1);
      return Math.round(a0 + t * (a1 - a0));
    }
  }
  return last[0];
}

/** Rate VO₂ max relative to the age/sex median. */
export function vo2Rating(vo2: number, age: number, sex: Sex): Rating {
  const ratio = vo2 / expectedVo2(age, sex);
  if (ratio >= 1.15) return { label: "Superior", accent: "text-chart-1" };
  if (ratio >= 1.05) return { label: "Excellent", accent: "text-chart-1" };
  if (ratio >= 0.95) return { label: "Good", accent: "text-chart-2" };
  if (ratio >= 0.85) return { label: "Fair", accent: "text-chart-3" };
  return { label: "Below average", accent: "text-chart-4" };
}

/** Rate resting heart rate (lower is fitter). */
export function restingHrRating(rhr: number): Rating {
  if (rhr < 49) return { label: "Athlete", accent: "text-chart-1" };
  if (rhr <= 55) return { label: "Excellent", accent: "text-chart-1" };
  if (rhr <= 61) return { label: "Good", accent: "text-chart-2" };
  if (rhr <= 70) return { label: "Average", accent: "text-chart-3" };
  return { label: "Elevated", accent: "text-chart-4" };
}
