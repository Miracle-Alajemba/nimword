import { triggerHaptic } from "./haptic-feedback.js";
describe("Haptic Feedback Helper", () => {
  test("safely calls vibrate if available", () => {
    expect(() => triggerHaptic([50])).not.toThrow();
  });
});
