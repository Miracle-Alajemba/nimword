import test from "node:test";
import assert from "node:assert";
import { calculateWordScore } from "../src/utils/score-calculator.js";

test("calculates score based on length", () => {
  assert.strictEqual(calculateWordScore("cat"), 10);
  assert.strictEqual(calculateWordScore("apple"), 25);
  assert.strictEqual(calculateWordScore("potatoes"), 100);
});
