import {WorkoutType} from "./WorkoutType";
import {Temperature} from "./Temperature";

export class WorkoutSession {
  private readonly _type: WorkoutType;
  private readonly _duration: number;
  private readonly _distance: number;
  private readonly _caloriesBurned: number;
  private readonly _startTime: string;
  private readonly _endTime: string;
  private readonly _timeZone: string;
  private readonly _temperature: Temperature;
  private readonly _routeName: string;


  constructor(type: WorkoutType, duration: number, distance: number, caloriesBurned: number, startTime: string,
              endTime: string, timeZone: string, temperature: Temperature, routeName: string) {
    this._type = type;
    this._duration = duration;
    this._distance = distance;
    this._caloriesBurned = caloriesBurned;
    this._startTime = startTime;
    this._endTime = endTime;
    this._timeZone = timeZone;
    this._temperature = temperature;
    this._routeName = routeName;
  }

  get type(): WorkoutType {
    return this._type;
  }

  get duration(): number {
    return this._duration;
  }

  get distance(): number {
    return this._distance;
  }

  get caloriesBurned(): number {
    return this._caloriesBurned;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get timeZone(): string {
    return this._timeZone;
  }

  get temperature(): Temperature {
    return this._temperature;
  }

  get routeName(): string {
    return this._routeName;
  }
}