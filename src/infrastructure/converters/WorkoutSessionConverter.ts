import { WorkoutSessionData } from "../types/Health";
import { WorkoutSession } from "../../domain/health/workout/WorkoutSession";
import { WorkoutType } from "../../domain/health/workout/WorkoutType";
import { Numbers } from "../../utility/Numbers";
import { TemperatureConverter } from "./TemperatureConverter";
import {fromString} from "../../domain/health/workout/TemperatureUnit";
import {Temperature} from "../../domain/health/workout/Temperature";

export class WorkoutSessionConverter {

  private readonly temperatureConverter = new TemperatureConverter();

  convert(data: WorkoutSessionData[]): WorkoutSession[] {
    return data.map(sessionData => {
        const type = WorkoutSessionConverter.getWorkoutType(sessionData.type);
        const duration = WorkoutSessionConverter.getNumericalValue(sessionData.duration, "Duration");
        const distance = WorkoutSessionConverter.getNumericalValue(sessionData.distance, "Distance");
        const calories = WorkoutSessionConverter.getNumericalValue(sessionData.energyBurned, "Calories");
        const startTime = WorkoutSessionConverter.getDate(sessionData.startTime);
        const endTime = WorkoutSessionConverter.getDate(sessionData.endTime);
        const temperatureData = sessionData.meta.temperature;
        const timeZone = sessionData.meta.timeZone;
        const temperature = temperatureData ? this.temperatureConverter.convert(temperatureData) : null;
        const routeName = sessionData.routeName;
        return new WorkoutSession(type, duration, distance, calories, startTime, endTime, timeZone, temperature, routeName);
      }
    );
  }

  convertGraphPayload(payload: any): WorkoutSession {
    const temperature = payload["_temperature"] ? payload["_temperature"] : undefined;
    const value = WorkoutSessionConverter.getNumericalValue(payload["_value"], "calories");
    const humidity = WorkoutSessionConverter.getNumericalValue(temperature["_humidity"], "humidity");
    const unit = fromString(temperature["_unit"]);
    return new WorkoutSession(
        payload["_type"], payload["_duration"], payload["_distance"], payload["_caloriesBurned"], payload["_startTime"],
        payload["_endTime"], payload["_timeZone"], new Temperature(value, unit, humidity), payload["_routeName"]
    );
  }

  private static getNumericalValue(value: string, name: string): number {
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

  private static getWorkoutType(type: string): WorkoutType {
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