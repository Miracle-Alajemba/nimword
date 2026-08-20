import test from "node:test";
import assert from "node:assert";
import { filterWordsByLength } from "../src/utils/word-length-filter.js";

test("filters words by length constraints", () => {
  const res = filterWordsByLength(["a", "cat", "elephant"], 3, 5);
  assert.deepStrictEqual(res, ["cat"]);
});
