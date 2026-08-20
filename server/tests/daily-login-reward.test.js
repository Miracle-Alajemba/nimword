import test from "node:test";
import assert from "node:assert";
import { getDailyRewardAmount } from "../src/utils/daily-login-reward.js";

test("returns daily bonus reward for streak day", () => {
  assert.strictEqual(getDailyRewardAmount(1), 10);
  assert.strictEqual(getDailyRewardAmount(7), 300);
});
