import test from "node:test";
import assert from "node:assert";
import { countVowels } from "../src/utils/vowel-counter.js";

test("counts number of vowels in a word", () => {
  assert.strictEqual(countVowels("education"), 5);
});
