export enum WorkoutType {
  ELLIPTICAL = "Elliptical",
  CYCLING = "Cycling",
  WALKING = "Walking",
  TENNIS = "Tennis",
  FUNCTIONAL_STRENGTH_TRAINING = "Functional Strength Training",
  TRADITIONAL_STRENGTH_TRAINING = "Traditional Strength Training",
  RUNNING = "Running",
  CORE_TRAINING = "Core Training",
  HIKING = "Hiking",
  YOGA = "Yoga",
  UNKNOWN = "N/A"
}

export function isCardio(type: WorkoutType): boolean {
  return (
    type === WorkoutType.RUNNING ||
    type === WorkoutType.WALKING ||
    type === WorkoutType.ELLIPTICAL ||
    type === WorkoutType.CYCLING ||
    type === WorkoutType.HIKING
  );
}