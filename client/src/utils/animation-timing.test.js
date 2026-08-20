import test from "node:test";
import assert from "node:assert";
import { EASING_CURVES } from "./animation-timing.js";

test("exports cubic-bezier curve strings", () => {
  assert.strictEqual(EASING_CURVES.EASE_OUT_BACK.startsWith("cubic-bezier"), true);
});
