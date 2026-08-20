import test from "node:test";
import assert from "node:assert";
import { getDailyDifficultyConfig } from "../src/utils/daily-challenge-reward-table.js";

test("returns difficulty target score and reward", () => {
  assert.strictEqual(getDailyDifficultyConfig("hard").targetScore, 80);
});
