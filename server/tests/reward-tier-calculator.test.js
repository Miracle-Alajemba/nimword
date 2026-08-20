import test from "node:test";
import assert from "node:assert";
import { calculateTieredReward } from "../src/utils/reward-tier-calculator.js";

test("allocates prize pool by rank placement", () => {
  assert.strictEqual(calculateTieredReward(1, 100), 50);
  assert.strictEqual(calculateTieredReward(2, 100), 30);
});
