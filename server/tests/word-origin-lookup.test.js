import test from "node:test";
import assert from "node:assert";
import { getWordCategory } from "../src/utils/word-origin-lookup.js";

test("categorizes word into tier name based on length", () => {
  assert.strictEqual(getWordCategory("elephant"), "Grand");
  assert.strictEqual(getWordCategory("cat"), "Basic");
});
