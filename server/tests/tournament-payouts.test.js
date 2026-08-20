import test from "node:test";
import assert from "node:assert";
import { calculateTournamentPrizePool } from "../src/utils/tournament-payouts.js";

test("calculates net tournament prize pool after fee", () => {
  const pool = calculateTournamentPrizePool(10, 10, 10);
  assert.strictEqual(pool.gross, 100);
  assert.strictEqual(pool.netPrize, 90);
});
