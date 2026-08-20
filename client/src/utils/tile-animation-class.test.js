import test from "node:test";
import assert from "node:assert";
import { getTileAnimationClass } from "./tile-animation-class.js";

test("returns correct CSS class for tile selection and pop states", () => {
  assert.strictEqual(getTileAnimationClass(true, false), "tile-selected-active");
  assert.strictEqual(getTileAnimationClass(false, true), "tile-pop-active");
});
