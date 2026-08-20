import test from "node:test";
import assert from "node:assert";
import { analyzeDictionary } from "../src/utils/dictionary-stats.js";

test("calculates dictionary average word length", () => {
  const stats = analyzeDictionary(["cat", "apple"]);
  assert.strictEqual(stats.total, 2);
  assert.strictEqual(stats.avgLen, 4);
});
