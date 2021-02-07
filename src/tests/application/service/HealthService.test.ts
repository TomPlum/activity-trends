import { HealthService } from "../../../application/service/HealthService";
import { HealthDataRepository } from "../../../infrastructure/repository/HealthDataRepository";

describe("Health Service", () => {

  jest.mock("../../../application/service/HealthService");
  jest.mock("../../../infrastructure/repository/HealthDataRepository")
  const mockRepository = jest.fn();
  const repository = new HealthDataRepository();
  /*jest.spyOn(HealthService.prototype, 'getOutdoorExercise').mockImplementation(function (this: HealthService) {
    this['repository'] = mockRepository;
  });*/

  const service = new HealthService();
  service["repository"] = repository;

  describe("Get Outdoor Exercise", () => {
    it('Should call the HealthRepository', () => {
      service.getCardioSessions();
      expect(mockRepository).toHaveBeenCalled();
    })
  });

  describe("Get Cardio Route", () => {
    it("Should call the Health Data Repository", () => {
      service.getCardioRoute("test-route-name");
      expect(repository).toHaveBeenCalled();
    });
  });
});