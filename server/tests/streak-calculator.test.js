import test from "node:test";
import assert from "node:assert";
import { calculateStreak } from "../src/utils/streak-calculator.js";

test("increments streak when played next day", () => {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  assert.strictEqual(calculateStreak(yesterday, 3), 4);
});
