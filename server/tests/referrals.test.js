import test from "node:test";
import assert from "node:assert/strict";
import {
  generateReferralCode,
  isValidReferralCode,
  calculateReferralCommission,
} from "../src/referrals.js";

test("generateReferralCode creates deterministic 6-character code for valid EVM wallet", () => {
  const address = "0x764b3f8761CEB44e6FFA6480484b706C3c3A8284";
  const code = generateReferralCode(address);
  assert.equal(code, "3A8284");
  assert.equal(code.length, 6);
});

test("generateReferralCode returns empty string for invalid address input", () => {
  assert.equal(generateReferralCode("invalid"), "");
  assert.equal(generateReferralCode(null), "");
  assert.equal(generateReferralCode("0x123"), "");
});

test("isValidReferralCode validates 6-character alphanumeric strings", () => {
  assert.equal(isValidReferralCode("3A8284"), true);
  assert.equal(isValidReferralCode("abcdef"), true);
  assert.equal(isValidReferralCode("123456"), true);
  assert.equal(isValidReferralCode("TOO_LONG"), false);
  assert.equal(isValidReferralCode("SHORT"), false);
  assert.equal(isValidReferralCode(""), false);
  assert.equal(isValidReferralCode(null), false);
});

test("calculateReferralCommission splits 20% of treasury fee to referrer", () => {
  const treasuryFee = 0.10; // 0.10 CELO
  const split = calculateReferralCommission(treasuryFee, 2000); // 20% of fee
  assert.equal(split.referrerCommission, 0.02); // 0.02 CELO
  assert.equal(split.netTreasuryFee, 0.08); // 0.08 CELO
});
