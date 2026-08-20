import test from "node:test";
import assert from "node:assert";
import { calculatePlayerWinRate } from "../src/utils/player-stats-calculator.js";

test("calculates win rate percentage", () => {
  assert.strictEqual(calculatePlayerWinRate(5, 10), 50);
  assert.strictEqual(calculatePlayerWinRate(0, 0), 0);
});
