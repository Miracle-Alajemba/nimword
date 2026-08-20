import test from "node:test";
import assert from "node:assert";
import { getDaysUntilSeasonEnd } from "../src/utils/leaderboard-season-calculator.js";

test("calculates remaining days in leaderboard season", () => {
  const future = new Date(Date.now() + 86400000 * 5).toISOString();
  assert.strictEqual(getDaysUntilSeasonEnd(future), 5);
});
