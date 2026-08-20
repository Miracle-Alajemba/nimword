import test from "node:test";
import assert from "node:assert";
import { getLeaderboardPageSlice } from "../src/utils/leaderboard-pagination-helper.js";

test("slices leaderboard items into page chunks", () => {
  const items = Array.from({ length: 50 }, (_, i) => ({ rank: i + 1 }));
  const page1 = getLeaderboardPageSlice(items, 1, 20);
  assert.strictEqual(page1.items.length, 20);
  assert.strictEqual(page1.totalPages, 3);
});
