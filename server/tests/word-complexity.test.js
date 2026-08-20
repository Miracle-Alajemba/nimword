import test from "node:test";
import assert from "node:assert";
import { calculateWordComplexity } from "../src/utils/word-complexity.js";

test("calculates character diversity percentage", () => {
  assert.strictEqual(calculateWordComplexity("cat"), 100);
  assert.strictEqual(calculateWordComplexity("aaaa"), 25);
});
