import test from "node:test";
import assert from "node:assert";
import { isTimerExpired } from "../src/utils/game-timer.js";

test("checks if game timer has expired", () => {
  const past = new Date(Date.now() - 70000).toISOString();
  assert.strictEqual(isTimerExpired(past, 60), true);
});
