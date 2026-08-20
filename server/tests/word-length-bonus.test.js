import test from "node:test";
import assert from "node:assert";
import { calculateLengthPoints } from "../src/utils/word-length-bonus.js";

test("calculates point value by word length", () => {
  assert.strictEqual(calculateLengthPoints("BLOCKCHAIN"), 100);
  assert.strictEqual(calculateLengthPoints("CAT"), 10);
});
