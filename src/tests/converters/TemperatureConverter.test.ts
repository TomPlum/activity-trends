import { TemperatureConverter } from "../../infrastructure/converters/TemperatureConverter";
import { WorkoutSessionTemperatureData } from "../../infrastructure/types/Health";
import { Temperature } from "../../domain/health/workout/Temperature";
import { TemperatureUnit } from "../../domain/health/workout/TemperatureUnit";
import each from "jest-each";

describe("Temperature Converter", () => {

  const converter = new TemperatureConverter();

  it("Should convert a valid response", () => {
    const data = getValidData();
    const response = converter.convert(data);
    expect(response).toEqual(new Temperature(42, TemperatureUnit.DEGREES_FAHRENHEIT, 7400));
  });

  describe("Temperature Unit", () => {
    it("Should convert DEGREES_CELSIUS", () => {
      const data = getValidDataWithTemperatureUnit("DEGREES_CELSIUS");
      const response = converter.convert(data);
      expect(response.unit).toEqual(TemperatureUnit.DEGREES_CELSIUS);
    });

    it("Should convert DEGREES_FAHRENHEIT", () => {
      const data = getValidDataWithTemperatureUnit("DEGREES_FAHRENHEIT");
      const response = converter.convert(data);
      expect(response.unit).toEqual(TemperatureUnit.DEGREES_FAHRENHEIT);
    });

    each([undefined, null, "", "DEGREES_UNKNOWN"]).it("Should convert '%s' to UNKNOWN", (unit) => {
      const data = getValidDataWithTemperatureUnit(unit);
      const response = converter.convert(data);
      expect(response.unit).toEqual(TemperatureUnit.UNKNOWN);
    });
  });

  function getValidDataWithTemperatureUnit(unit?: string) {
    const data = getValidData();
    data.unit = unit
    return data;
  }

  function getValidData(): WorkoutSessionTemperatureData {
    return {
      value: 42,
      unit: "DEGREES_FAHRENHEIT",
      humidity: 7400
    }
  }
});