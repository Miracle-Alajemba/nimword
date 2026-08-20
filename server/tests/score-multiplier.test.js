import test from "node:test";
import assert from "node:assert";
import { getLengthMultiplier } from "../src/utils/score-multiplier.js";

test("returns score multiplier based on length", () => {
  assert.strictEqual(getLengthMultiplier(8), 2.5);
  assert.strictEqual(getLengthMultiplier(3), 1.0);
});
