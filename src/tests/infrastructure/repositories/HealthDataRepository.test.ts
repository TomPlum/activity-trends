import { HealthDataRepository } from "../../../infrastructure/repository/HealthDataRepository";
import RestClient from "../../../infrastructure/RestClient";
import { WorkoutSessionData } from "../../../infrastructure/types/Health";

describe("Health Data Repository", () => {

  const repository = new HealthDataRepository();

  const mockGet = jest.fn();
  jest.mock("../../../infrastructure/RestClient")
  RestClient.get = mockGet

  describe("Get Running Data", () => {
    it("Should call the Rest Client with the correct endpoint", () => {
      whenCallApiReturnValidResponse();
      repository.getCardioSessions();
      expect(mockGet).toHaveBeenCalledWith("/workouts/sessions")
    });

    it("Should call return the response data if present", () => {
      whenCallApiReturnValidResponse();
      const response = repository.getCardioSessions();
      expect(response).toEqual(getValidWorkoutData());
    });

    it("Should throw an error with the caught errors message", () => {
      whenCallApiReturnError();
      expect(() => repository.getCardioSessions()).rejects.toThrow("Something went wrong.");
    })

    function whenCallApiReturnValidResponse() {
      mockGet.mockImplementationOnce(() => Promise.resolve({
        data: getValidWorkoutData(),
        errors: []
      }));
    }

    function whenCallApiReturnError() {
      mockGet.mockImplementationOnce(() => Promise.resolve({
        data: Promise.resolve(undefined),
        errors: [new Error("Something went wrong.")]
      }));
    }

    function getValidWorkoutData(): Promise<WorkoutSessionData[]> {
      return Promise.resolve([{
        type: "ELLIPTICAL",
        duration: "16.36445068319638",
        distance: "0.0",
        energyBurned: "177.234",
        startTime: "2017-10-02T19:54:13",
        endTime: "2017-10-02T20:10:35"
      }]);
    }
  });
});