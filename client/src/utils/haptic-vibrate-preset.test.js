import test from "node:test";
import assert from "node:assert";
import { triggerButtonVibration } from "./haptic-vibrate-preset.js";

test("triggers button vibration safely", () => {
  assert.doesNotThrow(() => triggerButtonVibration());
});
