import each from "jest-each";
import { Numbers } from "../../utility/Numbers";

describe("Numbers Utility", () => {
  describe("Is Valid Number", () => {
    each(["1", "1.5", "-1", "-1.034", "23493043", "2378.234239423"])
      .it("Should return true if the value '%s' is a valid Number", (value) => {
        expect(Numbers.isValidNumber(value)).toBe(true);
      });

    each(["A", "-", "1A", ""])
      .it("Should return false if the value '%s' is not a valid Number", (value) => {
        expect(Numbers.isValidNumber(value)).toBe(false);
      });
  });
});