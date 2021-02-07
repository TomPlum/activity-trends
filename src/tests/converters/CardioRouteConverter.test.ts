import { WorkoutRouteResponse } from "../../infrastructure/types/Health";
import { CardioRouteConverter } from "../../infrastructure/converters/CardioRouteConverter";
import { CardioRoute } from "../../domain/health/workout/CardioRoute";
import { RoutePoint } from "../../domain/health/workout/RoutePoint";

describe("Cardio Route Converter", () => {

    const converter = new CardioRouteConverter();

    it("Should convert a valid API response to the domain object", () => {
        const data = getValidRouteResponse();
        const response = converter.convert(data);
        expect(response).toEqual(getExpectedRoute());
    });

    function getValidRouteResponse(): WorkoutRouteResponse {
        return {
            creationDate: "2020-08-23T17:40:03",
            source: {
                name: "Apple Health Export",
                version: "1.1"
            },
            route: {
                points: [
                    {
                        lat: 53.252968,
                        long: -2.538252
                    },
                    {
                        lat: 53.252965,
                        long: -2.538253
                    },
                ]
            }
        };
    }

    function getExpectedRoute(): CardioRoute {
        const points = [new RoutePoint(53.252968, -2.538252), new RoutePoint(53.252965, -2.538253)]
        return new CardioRoute(points);
    }
});