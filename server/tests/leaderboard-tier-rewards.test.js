import test from "node:test";
import assert from "node:assert";
import { getSeasonPrizeAllocation } from "../src/utils/leaderboard-tier-rewards.js";

test("allocates season leaderboard prizes by rank", () => {
  assert.strictEqual(getSeasonPrizeAllocation(1, 1000), 400);
  assert.strictEqual(getSeasonPrizeAllocation(2, 1000), 250);
});
