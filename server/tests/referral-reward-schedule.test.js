import test from "node:test";
import assert from "node:assert";
import { calculateReferralSplit } from "../src/utils/referral-reward-schedule.js";

test("splits 20% to referrer and 80% to treasury", () => {
  const res = calculateReferralSplit(100, 20);
  assert.strictEqual(res.referrerShare, 20);
  assert.strictEqual(res.treasuryShare, 80);
});
