import test from "node:test";
import assert from "node:assert";
import { sortLeaderboard } from "../src/utils/leaderboard-sorter.js";

test("sorts players by score descending", () => {
  const players = [{ name: "A", score: 10 }, { name: "B", score: 50 }];
  const sorted = sortLeaderboard(players);
  assert.strictEqual(sorted[0].name, "B");
});
