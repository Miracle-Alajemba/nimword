import test from "node:test";
import assert from "node:assert";
import { selectBotWord } from "../src/utils/bot-behavior.js";

test("selects word based on bot difficulty level", () => {
  const words = ["cat", "apple", "elephant"];
  assert.strictEqual(selectBotWord(words, "easy"), "cat");
  assert.strictEqual(selectBotWord(words, "hard"), "elephant");
});
