import test from "node:test";
import assert from "node:assert";
import { aggregatePlayerStats } from "../src/utils/game-stats-aggregator.js";

test("aggregates total score and average score", () => {
  const stats = aggregatePlayerStats([{ score: 100 }, { score: 200 }]);
  assert.strictEqual(stats.totalGames, 2);
  assert.strictEqual(stats.avgScore, 150);
});
