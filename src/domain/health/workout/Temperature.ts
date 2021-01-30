import { TemperatureUnit } from "./TemperatureUnit";

export class Temperature {
  private readonly _value: number;
  private readonly _unit: TemperatureUnit;
  private readonly _humidity: number;

  constructor(value: number, unit: TemperatureUnit, humidity: number) {
    this._value = value;
    this._unit = unit;
    this._humidity = humidity;
  }

  get value(): number {
    return this._value;
  }

  get unit(): TemperatureUnit {
    return this._unit;
  }

  get humidity(): number {
    return this._humidity;
  }
}