import test from "node:test";
import assert from "node:assert";
import { CONFETTI_PRESETS } from "./confetti-preset-types.js";

test("exports victory and level up confetti particle presets", () => {
  assert.strictEqual(CONFETTI_PRESETS.VICTORY.particleCount, 120);
});
