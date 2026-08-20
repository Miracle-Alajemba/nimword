import test from "node:test";
import assert from "node:assert";
import { getStreakMultiplier } from "../src/utils/streak-bonus-multiplier.js";

test("calculates streak bonus multiplier", () => {
  assert.strictEqual(getStreakMultiplier(7), 1.5);
  assert.strictEqual(getStreakMultiplier(1), 1.0);
});
