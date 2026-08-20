import test from "node:test";
import assert from "node:assert";
import { vibrateShort } from "./mobile-vibration-feedback.js";

test("triggers short haptic vibration safely", () => {
  assert.doesNotThrow(() => vibrateShort());
});
