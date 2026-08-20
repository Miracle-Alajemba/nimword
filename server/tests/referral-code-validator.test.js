import test from "node:test";
import assert from "node:assert";
import { isValidReferralCodeFormat } from "../src/utils/referral-code-validator.js";

test("validates 6 to 8 character alphanumeric referral code", () => {
  assert.strictEqual(isValidReferralCodeFormat("WORD123"), true);
  assert.strictEqual(isValidReferralCodeFormat("BAD"), false);
});
