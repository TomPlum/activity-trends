import { WorkoutRouteResponse } from "../types/Health";
import { CardioRoute } from "../../domain/health/workout/CardioRoute";
import { RoutePoint } from "../../domain/health/workout/RoutePoint";

export class CardioRouteConverter {
    public convert(data: WorkoutRouteResponse): CardioRoute {
        return new CardioRoute(data.route.points.map(point => new RoutePoint(point.lat, point.long)));
    }
}