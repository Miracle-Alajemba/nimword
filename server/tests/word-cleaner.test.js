import test from "node:test";
import assert from "node:assert";
import { cleanWordInput } from "../src/utils/word-cleaner.js";

test("normalizes word to uppercase letters only", () => {
  assert.strictEqual(cleanWordInput("  apple! "), "APPLE");
});
