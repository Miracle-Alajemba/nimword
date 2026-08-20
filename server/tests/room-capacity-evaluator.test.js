import test from "node:test";
import assert from "node:assert";
import { getFillPercentage } from "../src/utils/room-capacity-evaluator.js";

test("calculates lobby fill percentage", () => {
  assert.strictEqual(getFillPercentage(3, 4), 75);
});
