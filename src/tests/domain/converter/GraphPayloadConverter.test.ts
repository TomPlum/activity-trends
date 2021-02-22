import {GraphPayloadConverter} from "../../../domain/converter/GraphPayloadConverter";
import {Temperature} from "../../../domain/health/workout/Temperature";
import {TemperatureUnit} from "../../../domain/health/workout/TemperatureUnit";
import {WorkoutType} from "../../../domain/health/workout/WorkoutType";
import each from "jest-each";

describe("Convert Graph Payload -> Workout Session", () => {

    const converter = new GraphPayloadConverter();

    describe("Temperature", () => {
        it("Should convert a valid temperature value", () => {
            const payload = getValidPayloadData();
            const response = converter.convertToWorkoutSession(payload);
            expect(response.temperature).toEqual(new Temperature(29, TemperatureUnit.DEGREES_FAHRENHEIT, 8000));
        });

        it("Should convert a null temperature as null", () => {
            const payload = getValidPayloadWithTemperature(null);
            const response = converter.convertToWorkoutSession(payload);
            expect(response.temperature).toEqual(new Temperature(null, null, null));
        });

        function getValidPayloadWithTemperature(temperature: any) {
            const data = getValidPayloadData();
            data["_temperature"] = temperature;
            return data;
        }
    });

    describe("Workout Type", () => {
        it("Should convert a valid type", () => {
            const payload = getValidPayloadData();
            const response = converter.convertToWorkoutSession(payload);
            expect(response.type).toBe(WorkoutType.ELLIPTICAL);
        });

        each([undefined, null, "", "BLAH"]).it("Should convert invalid value '%s' to UNKNOWN", (value: string) => {
            const payload = getValidPayloadWithType(value);
            const response = converter.convertToWorkoutSession(payload);
            expect(response.type).toBe(WorkoutType.UNKNOWN);
        });

        function getValidPayloadWithType(type: string) {
            const data = getValidPayloadData();
            data["_type"] = type;
            return data;
        }
    });

    function getValidPayloadData() {
        return {
            "_type": "Elliptical",
            "_duration": 20.01457124948502,
            "_distance": 0,
            "_caloriesBurned": 221.9819999999999,
            "_startTime": "2018-02-07T11:15:26",
            "_endTime": "2018-02-07T11:35:27",
            "_timeZone": "Europe/London",
            "_temperature": {
                "_value": 29,
                "_unit": "f",
                "_humidity": 8000
            },
            "_routeName": "route_2020-04-05_3.53pm"
        }
    }
});