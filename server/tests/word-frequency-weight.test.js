import test from "node:test";
import assert from "node:assert";
import { getWordRarityBonus } from "../src/utils/word-frequency-weight.js";

test("calculates rarity bonus based on word length", () => {
  assert.strictEqual(getWordRarityBonus(9), 3.0);
  assert.strictEqual(getWordRarityBonus(3), 1.0);
});
