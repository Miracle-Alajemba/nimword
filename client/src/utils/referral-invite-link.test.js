import test from "node:test";
import assert from "node:assert";
import { buildReferralInviteUrl } from "./referral-invite-link.js";

test("generates referral invite URL with wallet code", () => {
  const url = buildReferralInviteUrl("0x4302D510383C6be4a284759BB0616fc6ED57e9A1");
  assert.strictEqual(url.includes("ref=4302d5"), true);
});
