import { RoutePoint } from "./RoutePoint";

export class CardioRoute {
    private readonly _points: RoutePoint[];

    constructor(points: RoutePoint[]) {
        this._points = points;
    }

    get points(): RoutePoint[] {
        return this._points;
    }
}