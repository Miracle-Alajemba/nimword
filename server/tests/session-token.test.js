import test from "node:test";
import assert from "node:assert/strict";
import { generateSessionToken, verifySessionToken } from "../src/utils/session-token.js";

test("generateSessionToken produces deterministic HMAC hex string", () => {
  const token = generateSessionToken("0x764b3f8761CEB44e6FFA6480484b706C3c3A8284", "ROOM123");
  assert.equal(typeof token, "string");
  assert.equal(token.length, 64);
});

test("verifySessionToken validates legitimate tokens and rejects forged tokens", () => {
  const wallet = "0x764b3f8761CEB44e6FFA6480484b706C3c3A8284";
  const room = "ROOM123";
  const token = generateSessionToken(wallet, room);

  assert.equal(verifySessionToken(token, wallet, room), true);
  assert.equal(verifySessionToken("forged_token_string_with_64_characters_xxxxxxxxxxxxxxxxxxxxxxxxx", wallet, room), false);
  assert.equal(verifySessionToken(token, wallet, "WRONG_ROOM"), false);
});
