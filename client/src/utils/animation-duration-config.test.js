import test from "node:test";
import assert from "node:assert";
import { ANIMATION_DURATIONS } from "./animation-duration-config.js";

test("exports UI animation transition duration constants", () => {
  assert.strictEqual(ANIMATION_DURATIONS.NORMAL, 300);
});
