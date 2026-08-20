import test from "node:test";
import assert from "node:assert";
import { chunkArray } from "../src/utils/array-chunker.js";

test("chunks array into specified sub-array sizes", () => {
  const res = chunkArray([1, 2, 3, 4, 5], 2);
  assert.strictEqual(res.length, 3);
  assert.deepStrictEqual(res[0], [1, 2]);
});
