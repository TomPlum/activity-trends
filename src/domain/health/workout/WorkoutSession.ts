import { WorkoutType } from "./WorkoutType";

export class WorkoutSession {
  private readonly _type: WorkoutType;
  private readonly _duration: number;
  private readonly _distance: number;
  private readonly _caloriesBurned: number;
  private readonly _startTime: string;
  private readonly _endTime: string;


  constructor(type: WorkoutType, duration: number, distance: number, caloriesBurned: number, startTime: string, endTime: string) {
    this._type = type;
    this._duration = duration;
    this._distance = distance;
    this._caloriesBurned = caloriesBurned;
    this._startTime = startTime;
    this._endTime = endTime;
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
}