import test from "node:test";
import assert from "node:assert";
import { formatScoreWithCommas } from "../src/utils/score-formatter.js";

test("formats number with commas", () => {
  assert.strictEqual(formatScoreWithCommas(1250), "1,250");
});
