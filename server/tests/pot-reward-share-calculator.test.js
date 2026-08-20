import test from "node:test";
import assert from "node:assert";
import { calculatePlayerShare } from "../src/utils/pot-reward-share-calculator.js";

test("calculates proportional reward share", () => {
  assert.strictEqual(calculatePlayerShare(50, 100, 10), 5);
});
