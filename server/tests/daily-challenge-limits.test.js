import test from "node:test";
import assert from "node:assert";
import { DAILY_LIMITS } from "../src/constants/daily-challenge-limits.js";

test("exports daily challenge configuration limits", () => {
  assert.strictEqual(DAILY_LIMITS.MAX_PLAYS_PER_DAY, 1);
  assert.strictEqual(DAILY_LIMITS.RETRY_TICKET_COST_CELO, "0.05");
});
