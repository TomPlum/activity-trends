import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Dumbbell,
  Ear,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Map,
  Moon,
  PersonStanding,
  Scale,
  Trophy,
  Utensils,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Tailwind text colour token mapped to the domain accent. */
  accent: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, accent: "text-chart-1" },
  { href: "/insights", label: "Insights", icon: Lightbulb, accent: "text-chart-3" },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, accent: "text-workout" },
  { href: "/map", label: "Routes Map", icon: Map, accent: "text-chart-2" },
  { href: "/activity", label: "Activity", icon: Activity, accent: "text-chart-1" },
  { href: "/heart", label: "Heart & Vitals", icon: HeartPulse, accent: "text-chart-4" },
  { href: "/sleep", label: "Sleep", icon: Moon, accent: "text-chart-2" },
  { href: "/mobility", label: "Mobility", icon: PersonStanding, accent: "text-chart-1" },
  { href: "/nutrition", label: "Nutrition", icon: Utensils, accent: "text-chart-3" },
  { href: "/hearing", label: "Hearing", icon: Ear, accent: "text-chart-2" },
  { href: "/body", label: "Body", icon: Scale, accent: "text-chart-5" },
  { href: "/records", label: "Records", icon: Trophy, accent: "text-chart-4" },
];
