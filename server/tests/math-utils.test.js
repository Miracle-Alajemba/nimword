import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAccuracyPercentage,
  formatTokenAmount,
  calculateAverageWordScore,
} from "../src/utils/math-utils.js";

test("calculateAccuracyPercentage computes ratio correctly", () => {
  assert.equal(calculateAccuracyPercentage(8, 10), 80.0);
  assert.equal(calculateAccuracyPercentage(3, 4), 75.0);
  assert.equal(calculateAccuracyPercentage(0, 5), 0);
  assert.equal(calculateAccuracyPercentage(5, 0), 0);
});

test("formatTokenAmount truncates to 4 decimals cleanly", () => {
  assert.equal(formatTokenAmount(0.123456), 0.1235);
  assert.equal(formatTokenAmount(1.5), 1.5);
  assert.equal(formatTokenAmount(-0.5), 0);
});

test("calculateAverageWordScore computes average score per valid word", () => {
  assert.equal(calculateAverageWordScore(24, 4), 6.0); // 24 points across 4 words = 6.0
  assert.equal(calculateAverageWordScore(15, 2), 7.5);
  assert.equal(calculateAverageWordScore(0, 0), 0);
});
