import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeWalletAddress,
  sanitizeUsername,
  sanitizeWordInput,
} from "../src/utils/sanitizer.js";

test("sanitizeWalletAddress normalizes valid EVM address to lowercase", () => {
  const valid = "0x764b3f8761CEB44e6FFA6480484b706C3c3A8284";
  assert.equal(sanitizeWalletAddress(valid), "0x764b3f8761ceb44e6ffa6480484b706c3c3a8284");
});

test("sanitizeWalletAddress rejects malformed addresses", () => {
  assert.equal(sanitizeWalletAddress("invalid"), "");
  assert.equal(sanitizeWalletAddress("0x123"), "");
  assert.equal(sanitizeWalletAddress(null), "");
});

test("sanitizeUsername strips HTML and truncates to 24 characters", () => {
  assert.equal(sanitizeUsername("<b>SuperStar</b>"), "SuperStar");
  assert.equal(sanitizeUsername(""), "Anonymous Player");
  assert.equal(sanitizeUsername("   "), "Anonymous Player");
  assert.equal(
    sanitizeUsername("ThisIsAVeryLongPlayerNameThatExceedsLimit"),
    "ThisIsAVeryLongPlayerNam"
  );
});

test("sanitizeWordInput upper-cases and strips non-alphabetic chars", () => {
  assert.equal(sanitizeWordInput("hello!"), "HELLO");
  assert.equal(sanitizeWordInput("  world 123 "), "WORLD");
  assert.equal(sanitizeWordInput(""), "");
});
