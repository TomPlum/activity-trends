import {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Mountain,
  Music,
  Trophy,
  Waves,
  type LucideIcon,
} from "lucide-react";

// Names match the `icon` field in lib/health/workout-types.ts.
const ICONS: Record<string, LucideIcon> = {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Mountain,
  Music,
  Trophy,
  Waves,
};

export function WorkoutIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon className={className} />;
}
