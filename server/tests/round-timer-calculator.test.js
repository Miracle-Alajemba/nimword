import test from "node:test";
import assert from "node:assert";
import { calculateRemainingSeconds } from "../src/utils/round-timer-calculator.js";

test("calculates remaining round seconds", () => {
  const now = new Date().toISOString();
  assert.strictEqual(calculateRemainingSeconds(now, 60), 60);
});
