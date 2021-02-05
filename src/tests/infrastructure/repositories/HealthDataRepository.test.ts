import {HealthDataRepository} from "../../../infrastructure/repository/HealthDataRepository";
import RestClient from "../../../infrastructure/RestClient";
import {WorkoutRouteResponse, WorkoutSessionResponse} from "../../../infrastructure/types/Health";

describe("Health Data Repository", () => {

  const repository = new HealthDataRepository();

  const mockGet = jest.fn();
  jest.mock("../../../infrastructure/RestClient")
  RestClient.get = mockGet

  describe("Get Cardio Sessions", () => {
    it("Should call the Rest Client with the correct endpoint", () => {
      whenCallApiReturnValidResponse(getValidWorkoutData());
      repository.getCardioSessions();
      expect(mockGet).toHaveBeenCalledWith("/workouts/sessions")
    });

    it("Should return the response data if present", () => {
      whenCallApiReturnValidResponse(getValidWorkoutData());
      const response = repository.getCardioSessions();
      expect(response).toEqual(getValidWorkoutData());
    });

    it("Should throw an error with the caught errors message", () => {
      whenCallApiReturnError();
      expect(() => repository.getCardioSessions()).rejects.toThrow("Something went wrong.");
    });

    function getValidWorkoutData(): Promise<WorkoutSessionResponse> {
      return Promise.resolve({
        sessions: [{
          type: "ELLIPTICAL",
          duration: "16.36445068319638",
          distance: "0.0",
          energyBurned: "177.234",
          startTime: "2017-10-02T19:54:13",
          endTime: "2017-10-02T20:10:35",
          meta: {
            timeZone: "Europe/London",
            temperature: {
              value: 53,
              unit: "DEGREES_FAHRENHEIT",
              humidity: 8300
            }
          }
        }],
      });
    }
  });

  describe("Get Workout Session Route", () => {
    it("Should call the Rest Client with the correct endpoint", () => {
      whenCallApiReturnValidResponse(getValidRouteResponse());
      repository.getWorkoutSessionRoute("example-route-name");
      expect(mockGet).toHaveBeenCalledWith("/workouts/route/example-route-name");
    });

    it("Should return the response data if present", () => {
      whenCallApiReturnValidResponse(getValidRouteResponse());
      const response = repository.getWorkoutSessionRoute("example-route-name");
      expect(response).toEqual(getValidRouteResponse());
    });

    it("Should throw an error with the caught errors message", () => {
      whenCallApiReturnError();
      expect(() => repository.getWorkoutSessionRoute("route-name")).rejects.toThrow("Something went wrong.");
    });

    function getValidRouteResponse(): Promise<WorkoutRouteResponse> {
      return Promise.resolve({
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
      });
    }
  });

  function whenCallApiReturnValidResponse(data) {
    mockGet.mockImplementationOnce(() => Promise.resolve({
      data: data,
      errors: []
    }));
  }

  function whenCallApiReturnError() {
    mockGet.mockImplementationOnce(() => Promise.resolve({
      data: Promise.resolve(undefined),
      errors: [new Error("Something went wrong.")]
    }));
  }
});