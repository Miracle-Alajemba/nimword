import test from "node:test";
import assert from "node:assert";
import { shuffleArray } from "../src/utils/array-helpers.js";

test("returns shuffled array with same length", () => {
  const original = [1, 2, 3, 4, 5];
  const shuffled = shuffleArray(original);
  assert.strictEqual(shuffled.length, original.length);
  assert.deepStrictEqual([...shuffled].sort(), [...original].sort());
});
