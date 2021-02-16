import {WorkoutSession} from "../health/workout/WorkoutSession";
import {Temperature} from "../health/workout/Temperature";
import {fromString} from "../health/workout/TemperatureUnit";

export class GraphPayloadConverter {
    convertToWorkoutSession(payload: any): WorkoutSession {
        const temperaturePayload = payload["_temperature"];
        let temperature = new Temperature(null, null, null);
        if (temperaturePayload) {
            const value = Number(temperaturePayload["_value"]);
            const humidity = Number(temperaturePayload["_humidity"])
            const unit = fromString(temperaturePayload["_unit"]);
            temperature = new Temperature(value, unit, humidity);
        }
        return new WorkoutSession(
            payload["_type"], payload["_duration"], payload["_distance"], payload["_caloriesBurned"], payload["_startTime"],
            payload["_endTime"], payload["_timeZone"], temperature, payload["_routeName"]
        );
    }
}