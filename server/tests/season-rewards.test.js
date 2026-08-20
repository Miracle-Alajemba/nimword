import test from "node:test";
import assert from "node:assert/strict";
import { calculateWeeklySeasonBonus } from "../src/season-rewards.js";

test("calculateWeeklySeasonBonus distributes bonus pool to top 3 leaderboard players", () => {
  const leaderboard = [
    { address: "0x1111111111111111111111111111111111111111", score: 450 },
    { address: "0x2222222222222222222222222222222222222222", score: 320 },
    { address: "0x3333333333333333333333333333333333333333", score: 210 },
    { address: "0x4444444444444444444444444444444444444444", score: 100 },
  ];

  const { payouts, totalDistributed } = calculateWeeklySeasonBonus(leaderboard, 1.75);

  assert.equal(payouts.length, 3);
  assert.equal(payouts[0].rank, 1);
  assert.equal(payouts[0].address, "0x1111111111111111111111111111111111111111");
  assert.equal(payouts[0].amount, 1.0); // ~1.0 CELO for 1st
  assert.equal(payouts[1].amount, 0.5); // ~0.5 CELO for 2nd
  assert.equal(payouts[2].amount, 0.25); // ~0.25 CELO for 3rd
  assert.equal(totalDistributed, 1.75);
});

test("calculateWeeklySeasonBonus handles less than 3 players gracefully", () => {
  const leaderboard = [
    { address: "0x1111111111111111111111111111111111111111", score: 450 },
  ];

  const { payouts } = calculateWeeklySeasonBonus(leaderboard, 1.75);
  assert.equal(payouts.length, 1);
  assert.equal(payouts[0].amount, 1.0);
});
