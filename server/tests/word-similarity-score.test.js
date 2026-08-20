import test from "node:test";
import assert from "node:assert";
import { calculateLevenshteinDistance } from "../src/utils/word-similarity-score.js";

test("calculates edit distance between two strings", () => {
  assert.strictEqual(calculateLevenshteinDistance("kitten", "sitting"), 3);
  assert.strictEqual(calculateLevenshteinDistance("word", "word"), 0);
});
