import test from "node:test";
import assert from "node:assert";
import { getRemainingCooldownSeconds } from "../src/utils/daily-cooldown-evaluator.js";

test("calculates remaining daily cooldown seconds", () => {
  const future = new Date(Date.now() + 60000).toISOString();
  assert.strictEqual(getRemainingCooldownSeconds(future) > 0, true);
});
