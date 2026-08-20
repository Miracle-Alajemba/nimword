import test from "node:test";
import assert from "node:assert";
import { isRhymeCandidate } from "../src/utils/word-rhyme-finder.js";

test("matches words ending with same 3-letter suffix", () => {
  assert.strictEqual(isRhymeCandidate("flight", "bright"), true);
  assert.strictEqual(isRhymeCandidate("cat", "dog"), false);
});
