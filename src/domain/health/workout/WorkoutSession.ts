import { WorkoutType } from "./WorkoutType";

export class WorkoutSession {
  private readonly _type: WorkoutType;
  private readonly _duration: Number;
  private readonly _distance: Number;
  private readonly _caloriesBurned: Number;
  private readonly _startTime: string;
  private readonly _endTime: string;


  constructor(type: WorkoutType, duration: Number, distance: Number, caloriesBurned: Number, startTime: string, endTime: string) {
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

  get duration(): Number {
    return this._duration;
  }

  get distance(): Number {
    return this._distance;
  }

  get caloriesBurned(): Number {
    return this._caloriesBurned;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }
}