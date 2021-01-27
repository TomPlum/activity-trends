export enum WorkoutType {
  ELLIPTICAL,
  CYCLING,
  WALKING,
  TENNIS,
  FUNCTIONAL_STRENGTH_TRAINING,
  TRADITIONAL_STRENGTH_TRAINING,
  RUNNING,
  CORE_TRAINING,
  HIKING,
  YOGA,
  UNKNOWN
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