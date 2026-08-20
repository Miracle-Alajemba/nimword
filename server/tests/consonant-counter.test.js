import test from "node:test";
import assert from "node:assert";
import { countConsonants } from "../src/utils/consonant-counter.js";

test("counts number of consonants in a word", () => {
  assert.strictEqual(countConsonants("rhythm"), 6);
});
