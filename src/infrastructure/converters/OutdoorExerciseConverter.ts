import { OutdoorExercise } from "../../domain/health/workout/OutdoorExercise";
import { WorkoutSessionData } from "../types/Health";
import { WorkoutSession } from "../../domain/health/workout/WorkoutSession";
import { WorkoutType } from "../../domain/health/workout/WorkoutType";
import { Numbers } from "../../utility/Numbers";

export class OutdoorExerciseConverter {
  convert(data: WorkoutSessionData[]): OutdoorExercise {
    const sessions = data.map(sessionData => {
        const type = OutdoorExerciseConverter.getWorkoutType(sessionData.type);
        const duration = OutdoorExerciseConverter.getNumericalValue(sessionData.duration, "Duration");
        const distance = OutdoorExerciseConverter.getNumericalValue(sessionData.distance, "Distance");
        const calories = OutdoorExerciseConverter.getNumericalValue(sessionData.energyBurned, "Calories");
        const startTime = OutdoorExerciseConverter.getDate(sessionData.startTime);
        const endTime = OutdoorExerciseConverter.getDate(sessionData.endTime);
        return new WorkoutSession(type, duration, distance, calories, startTime, endTime);
      }
    );
    return new OutdoorExercise(sessions);
  }

  private static getNumericalValue(value: string, name: string): Number {
    if (Numbers.isValidNumber(value)) {
      const number = Number(value);
      if (number >= 0) {
        return number;
      }
    }
    throw new ReferenceError("Invalid " + name + " Value " + value);
  }

  private static getDate(value: string): string {
    if (!value) {
      throw new ReferenceError("Invalid Date/Time String: " + value);
    }
    return value;
  }

  private static getWorkoutType(type: String): WorkoutType {
    switch (type) {
      case "ELLIPTICAL":
        return WorkoutType.ELLIPTICAL;
      case "CYCLING":
        return WorkoutType.CYCLING;
      case "WALKING":
        return WorkoutType.WALKING;
      case "TENNIS":
        return WorkoutType.TENNIS;
      case "FUNCTIONAL_STRENGTH_TRAINING":
        return WorkoutType.FUNCTIONAL_STRENGTH_TRAINING;
      case "TRADITIONAL_STRENGTH_TRAINING":
        return WorkoutType.TRADITIONAL_STRENGTH_TRAINING;
      case "RUNNING":
        return WorkoutType.RUNNING;
      case "CORE_TRAINING":
        return WorkoutType.CORE_TRAINING;
      case "HIKING":
        return WorkoutType.HIKING;
      case "YOGA":
        return WorkoutType.YOGA;
      default:
        return WorkoutType.UNKNOWN;
    }
  }
}