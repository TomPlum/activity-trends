export enum TemperatureUnit {
  DEGREES_FAHRENHEIT = "f",
  DEGREES_CELSIUS = "c",
  UNKNOWN = "?"
}

export function fromString(value: string): TemperatureUnit {
  switch(value) {
    case "f": return TemperatureUnit.DEGREES_FAHRENHEIT;
    case "c": return TemperatureUnit.DEGREES_CELSIUS
    default: return TemperatureUnit.UNKNOWN;
  }
}