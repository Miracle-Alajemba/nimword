import test from "node:test";
import assert from "node:assert";
import { generatePracticeRoundSeed } from "../src/utils/practice-mode-generator.js";

test("generates practice mode seed for difficulty level", () => {
  const seed = generatePracticeRoundSeed("hard");
  assert.strictEqual(seed.sourceWord, "BLOCKCHAIN");
  assert.strictEqual(seed.targetScore, 80);
});
