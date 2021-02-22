import { WorkoutSessionTemperatureData } from "../types/Health";
import { Temperature } from "../../domain/health/workout/Temperature";
import { TemperatureUnit } from "../../domain/health/workout/TemperatureUnit";

export class TemperatureConverter {
  public convert(data: WorkoutSessionTemperatureData): Temperature {
    const value = data.value;
    const unit = this.getUnit(data.unit);
    const humidity = data.humidity;
    return new Temperature(value, unit, humidity);
  }

  private getUnit(value: string): TemperatureUnit {
    switch(value) {
      case "DEGREES_FAHRENHEIT": return TemperatureUnit.DEGREES_FAHRENHEIT;
      case "DEGREES_CELSIUS": return TemperatureUnit.DEGREES_CELSIUS;
      default: return TemperatureUnit.UNKNOWN;
    }
  }
}