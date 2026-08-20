import test from "node:test";
import assert from "node:assert";
import { evaluateAchievements } from "../src/utils/achievement-tracker.js";

test("unlocks achievements when stats criteria met", () => {
  const achievements = evaluateAchievements({ wordsFound: 150, wins: 12 });
  assert.strictEqual(achievements.includes("VOCABULIST"), true);
  assert.strictEqual(achievements.includes("CHAMPION"), true);
});
