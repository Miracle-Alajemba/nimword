import test from "node:test";
import assert from "node:assert";
import { isAnagram } from "../src/utils/word-anagram-checker.js";

test("verifies anagram pairs", () => {
  assert.strictEqual(isAnagram("listen", "silent"), true);
  assert.strictEqual(isAnagram("apple", "banana"), false);
});
