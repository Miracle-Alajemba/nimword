import { isTouchDevice } from "./device-detection.js";
describe("Device Detection", () => {
  test("returns boolean for touch device check", () => {
    expect(typeof isTouchDevice()).toBe("boolean");
  });
});
