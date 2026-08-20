import test from "node:test";
import assert from "node:assert";
import { safeJsonParse } from "../src/utils/safe-json-parse.js";

test("parses valid JSON and returns fallback for invalid JSON", () => {
  assert.deepStrictEqual(safeJsonParse('{"a":1}'), { a: 1 });
  assert.strictEqual(safeJsonParse("invalid json", "default"), "default");
});
