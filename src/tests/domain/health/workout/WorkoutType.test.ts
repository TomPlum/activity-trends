import each from "jest-each";
import { isCardio, WorkoutType } from "../../../../domain/health/workout/WorkoutType";

describe("Workout Type", () => {
  describe("Is Cardio", () => {
    each([WorkoutType.WALKING, WorkoutType.RUNNING, WorkoutType.HIKING, WorkoutType.ELLIPTICAL, WorkoutType.CYCLING])
      .it("%s should return true as it is considered cardio", (type) => {
        expect(isCardio(type)).toBe(true);
      });

    each([
      WorkoutType.FUNCTIONAL_STRENGTH_TRAINING,
      WorkoutType.TRADITIONAL_STRENGTH_TRAINING,
      WorkoutType.CORE_TRAINING,
      WorkoutType.YOGA,
      WorkoutType.UNKNOWN
    ]).it("%s should return false as it is not considered cardio", (type) => {
      expect(isCardio(type)).toBe(false);
    });
  });
});