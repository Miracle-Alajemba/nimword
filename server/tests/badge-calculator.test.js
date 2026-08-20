import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateUnlockedBadges,
  BADGE_DEFINITIONS,
} from "../src/utils/badge-calculator.js";

test("calculateUnlockedBadges unlocks Word Smith for high score", () => {
  const badges = calculateUnlockedBadges({ totalScore: 60 });
  assert.equal(badges.length, 1);
  assert.equal(badges[0].id, BADGE_DEFINITIONS.WORD_SMITH.id);
});

test("calculateUnlockedBadges unlocks multiple badges when thresholds met", () => {
  const badges = calculateUnlockedBadges({
    totalScore: 100,
    totalWords: 12,
    wins: 5,
    streak: 4,
  });
  assert.equal(badges.length, 4);
});

test("calculateUnlockedBadges returns empty array for new player stats", () => {
  const badges = calculateUnlockedBadges({ totalScore: 0 });
  assert.equal(badges.length, 0);
});
