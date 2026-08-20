import test from "node:test";
import assert from "node:assert";
import { calculateComboMultiplier } from "../src/utils/combo-calculator.js";

test("calculates combo score multiplier", () => {
  assert.strictEqual(calculateComboMultiplier(5), 2.0);
  assert.strictEqual(calculateComboMultiplier(1), 1.0);
});
