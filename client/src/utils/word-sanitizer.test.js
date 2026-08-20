import test, { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeSubmittedWord, isValidWordLength } from "./word-sanitizer.js";

describe("Word Sanitizer Utility", () => {
  it("should normalize raw input word string", () => {
    assert.strictEqual(normalizeSubmittedWord("  word!12 "), "WORD");
  });

  it("should validate word length constraints", () => {
    assert.strictEqual(isValidWordLength("cat"), true);
    assert.strictEqual(isValidWordLength("hi"), false);
  });
});
