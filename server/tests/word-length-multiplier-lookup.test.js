import test from "node:test";
import assert from "node:assert";
import { getMultiplierByLength } from "../src/utils/word-length-multiplier-lookup.js";

test("returns score multiplier based on word length", () => {
  assert.strictEqual(getMultiplierByLength(8), 3.0);
  assert.strictEqual(getMultiplierByLength(3), 1.0);
});
