import { OutdoorExerciseConverter } from "../../infrastructure/converters/OutdoorExerciseConverter";
import { WorkoutSessionData } from "../../infrastructure/types/Health";
import { WorkoutType } from "../../domain/health/workout/WorkoutType";

describe('Outdoor Exercise Converter', () => {

  const converter = new OutdoorExerciseConverter();
  const each = require("jest-each").default;

  describe("Workout Type", () => {
    it('Should convert type ELLIPTICAL', () => {
      const data = [getSessionDataWithType("ELLIPTICAL")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.ELLIPTICAL);
    });

    it('Should convert type CYCLING', () => {
      const data = [getSessionDataWithType("CYCLING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.CYCLING);
    });

    it('Should convert type WALKING', () => {
      const data = [getSessionDataWithType("WALKING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.WALKING);
    });

    it('Should convert type TENNIS', () => {
      const data = [getSessionDataWithType("TENNIS")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.TENNIS);
    });

    it('Should convert type FUNCTIONAL_STRENGTH_TRAINING', () => {
      const data = [getSessionDataWithType("FUNCTIONAL_STRENGTH_TRAINING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.FUNCTIONAL_STRENGTH_TRAINING);
    });

    it('Should convert type TRADITIONAL_STRENGTH_TRAINING', () => {
      const data = [getSessionDataWithType("TRADITIONAL_STRENGTH_TRAINING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.TRADITIONAL_STRENGTH_TRAINING);
    });

    it('Should convert type RUNNING', () => {
      const data = [getSessionDataWithType("RUNNING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.RUNNING);
    });

    it('Should convert type CORE_TRAINING', () => {
      const data = [getSessionDataWithType("CORE_TRAINING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.CORE_TRAINING);
    });

    it('Should convert type HIKING', () => {
      const data = [getSessionDataWithType("HIKING")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.HIKING);
    });

    it('Should convert type YOGA', () => {
      const data = [getSessionDataWithType("YOGA")];
      const response = converter.convert(data);
      expect(response.sessions[0].type).toBe(WorkoutType.YOGA);
    });

    each([undefined, null, "", "WHO_KNOWS"])
      .it('Should convert invalid type %s', (type) => {
        const data = [getSessionDataWithType(type)];
        const response = converter.convert(data);
        expect(response.sessions[0].type).toBe(WorkoutType.UNKNOWN);
      });

    function getSessionDataWithType(type: string): WorkoutSessionData {
      const data = getValidSessionData();
      data.type = type;
      return data;
    }
  });

  describe("Duration", () => {
    it('Should convert valid value into a Number', () => {
      const data = [getSessionDataWithDuration("25.82323")];
      const response = converter.convert(data);
      expect(response.sessions[0].duration).toBe(25.82323);
    });

    each([undefined, null, "", "-50", ""])
      .it("Should throw an exception if the value is '%s'", (value) => {
      const data = [getSessionDataWithDuration(value)];
      expect(() => converter.convert(data)).toThrow(ReferenceError);
    });

    function getSessionDataWithDuration(duration: string): WorkoutSessionData {
      const data = getValidSessionData();
      data.duration = duration;
      return data;
    }
  });

  describe("Distance", () => {
    it('Should convert valid value into a Number', () => {
      const data = [getSessionDataWithDistance("3.5623165")];
      const response = converter.convert(data);
      expect(response.sessions[0].distance).toBe(3.5623165);
    });

    each([undefined, null, "", "-50", ""])
      .it("Should throw an exception if the value is '%s'", (value) => {
        const data = [getSessionDataWithDistance(value)];
        expect(() => converter.convert(data)).toThrow(ReferenceError);
      });

    function getSessionDataWithDistance(distance: string): WorkoutSessionData {
      const data = getValidSessionData();
      data.distance = distance;
      return data;
    }
  });

  describe("Start Time", () => {
    it("Should convert a valid value", () => {
      const data = [getSessionDataWithStartTime("2017-10-02T19:54:13")];
      const response = converter.convert(data);
      expect(response.sessions[0].startTime).toBe("2017-10-02T19:54:13");
    });

    each([undefined, null, ""])
      .it("Should throw an exception if the value is '%s'", (value) => {
        const data = [getSessionDataWithStartTime(value)];
        expect(() => converter.convert(data)).toThrow(ReferenceError);
      });

    function getSessionDataWithStartTime(time: string): WorkoutSessionData {
      const data = getValidSessionData();
      data.startTime = time;
      return data;
    }
  });

  describe("End Time", () => {
    it("Should convert a valid value", () => {
      const data = [getSessionDataWithEndTime("2017-10-02T19:54:13")];
      const response = converter.convert(data);
      expect(response.sessions[0].endTime).toBe("2017-10-02T19:54:13");
    });

    each([undefined, null, ""])
      .it("Should throw an exception if the value is '%s'", (value) => {
        const data = [getSessionDataWithEndTime(value)];
        expect(() => converter.convert(data)).toThrow(ReferenceError);
      });

    function getSessionDataWithEndTime(time: string): WorkoutSessionData {
      const data = getValidSessionData();
      data.endTime = time;
      return data;
    }
  });

  function getValidSessionData(): WorkoutSessionData {
    return {
      type: "RUNNING",
      duration: "16.36445068319638",
      distance: "0.0",
      energyBurned: "177.234",
      startTime: "2017-10-02T19:54:13",
      endTime: "2017-10-02T20:10:35"
    }
  }
});