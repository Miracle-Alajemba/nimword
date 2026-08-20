import test from "node:test";
import assert from "node:assert";
import { calculatePercent } from "../src/utils/percent-calculator.js";

test("calculates rounded percentage", () => {
  assert.strictEqual(calculatePercent(25, 100), 25);
  assert.strictEqual(calculatePercent(1, 3), 33);
});
