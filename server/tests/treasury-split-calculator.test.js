import test from "node:test";
import assert from "node:assert";
import { calculatePotSplit } from "../src/utils/treasury-split-calculator.js";

test("calculates 10% dev fee split from total pot", () => {
  const res = calculatePotSplit(100, 1000);
  assert.strictEqual(res.devFee, 10);
  assert.strictEqual(res.prizePool, 90);
});
