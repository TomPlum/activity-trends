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

  describe("Nicely formatted string value", () => {
    it("Should return 'Elliptical' when the WorkoutType is ELLIPTICAL", () => {
      expect(WorkoutType.ELLIPTICAL).toEqual("Elliptical");
    });

    it("Should return 'Cycling' when the WorkoutType is CYCLING", () => {
      expect(WorkoutType.CYCLING).toEqual("Cycling");
    });

    it("Should return 'Walking' when the WorkoutType is WALKING", () => {
      expect(WorkoutType.WALKING).toEqual("Walking");
    });

    it("Should return 'Tennis' when the WorkoutType is TENNIS", () => {
      expect(WorkoutType.TENNIS).toEqual("Tennis");
    });

    it("Should return 'Functional Strength Training' when the WorkoutType is FUNCTIONAL_STRENGTH_TRAINING", () => {
      expect(WorkoutType.FUNCTIONAL_STRENGTH_TRAINING).toEqual("Functional Strength Training");
    });

    it("Should return 'Traditional Strength Training' when the WorkoutType is TRADITIONAL_STRENGTH_TRAINING", () => {
      expect(WorkoutType.TRADITIONAL_STRENGTH_TRAINING).toEqual("Traditional Strength Training");
    });

    it("Should return 'Running' when the WorkoutType is RUNNING", () => {
      expect(WorkoutType.RUNNING).toEqual("Running");
    });

    it("Should return 'Core Training' when the WorkoutType is CORE_TRAINING", () => {
      expect(WorkoutType.CORE_TRAINING).toEqual("Core Training");
    });

    it("Should return 'Hiking' when the WorkoutType is HIKING", () => {
      expect(WorkoutType.HIKING).toEqual("Hiking");
    });

    it("Should return 'Yoga' when the WorkoutType is YOGA", () => {
      expect(WorkoutType.YOGA).toEqual("Yoga");
    });

    it("Should return 'N/A' when the WorkoutType is UNKNOWN", () => {
      expect(WorkoutType.UNKNOWN).toEqual("N/A");
    });
  });
});