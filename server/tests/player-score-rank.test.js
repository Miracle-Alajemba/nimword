import test from "node:test";
import assert from "node:assert";
import { rankPlayersByScore } from "../src/utils/player-score-rank.js";

test("assigns 1-based numerical ranks by score", () => {
  const res = rankPlayersByScore([{ score: 50 }, { score: 100 }]);
  assert.strictEqual(res[0].rank, 1);
  assert.strictEqual(res[0].score, 100);
});
