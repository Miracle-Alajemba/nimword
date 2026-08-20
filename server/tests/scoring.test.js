import test from "node:test";
import assert from "node:assert/strict";

function getWordScore(word) {
  if (!word || typeof word !== "string") return 0;
  const len = word.trim().length;
  if (len >= 6) return 12;
  if (len === 5) return 8;
  if (len === 4) return 5;
  if (len === 3) return 3;
  return 0;
}

function calculateRewardSplit(totalPool, players) {
  const prizePool = totalPool * 0.9;
  const treasuryFee = totalPool * 0.1;
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  if (totalScore === 0) {
    return {
      treasuryFee,
      payouts: players.map((p) => ({ address: p.address, amount: 0 })),
    };
  }

  const payouts = players.map((p) => ({
    address: p.address,
    amount: Number(((p.score / totalScore) * prizePool).toFixed(4)),
  }));

  return { treasuryFee, payouts };
}

test("getWordScore correctly assigns point thresholds by word length", () => {
  assert.equal(getWordScore("hi"), 0); // <3 letters = 0 pts
  assert.equal(getWordScore("cat"), 3); // 3 letters = 3 pts
  assert.equal(getWordScore("lend"), 5); // 4 letters = 5 pts
  assert.equal(getWordScore("spine"), 8); // 5 letters = 8 pts
  assert.equal(getWordScore("splendid"), 12); // 6+ letters = 12 pts
});

test("calculateRewardSplit allocates 90% prize pool proportionally by score", () => {
  const players = [
    { address: "0x1111111111111111111111111111111111111111", score: 60 },
    { address: "0x2222222222222222222222222222222222222222", score: 40 },
  ];
  const totalPool = 1.0; // 1 CELO total

  const result = calculateRewardSplit(totalPool, players);

  assert.equal(result.treasuryFee, 0.1); // 10% treasury fee
  assert.equal(result.payouts[0].amount, 0.54); // 60% of 0.9 = 0.54 CELO
  assert.equal(result.payouts[1].amount, 0.36); // 40% of 0.9 = 0.36 CELO
});
