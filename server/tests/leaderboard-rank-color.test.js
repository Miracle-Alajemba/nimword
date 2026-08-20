import test from "node:test";
import assert from "node:assert";
import { getRankBadgeColor } from "../src/utils/leaderboard-rank-color.js";

test("maps rank 1, 2, 3 to gold, silver, bronze hex colors", () => {
  assert.strictEqual(getRankBadgeColor(1), "#fbbf24");
  assert.strictEqual(getRankBadgeColor(2), "#94a3b8");
});
