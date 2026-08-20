import { TOAST_DURATION } from "./toast-config.js";
describe("Toast Config", () => {
  test("exports duration constants", () => {
    expect(TOAST_DURATION.MEDIUM).toBe(4000);
  });
});
