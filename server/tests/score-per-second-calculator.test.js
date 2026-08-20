import test from "node:test";
import assert from "node:assert";
import { calculatePace } from "../src/utils/score-per-second-calculator.js";

test("calculates scoring pace per second", () => {
  assert.strictEqual(calculatePace(60, 60), 1);
  assert.strictEqual(calculatePace(120, 60), 2);
});
