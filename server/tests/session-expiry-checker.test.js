import test from "node:test";
import assert from "node:assert";
import { isSessionExpired } from "../src/utils/session-expiry-checker.js";

test("evaluates user session expiry based on TTL seconds", () => {
  const past = new Date(Date.now() - 7200000).toISOString();
  assert.strictEqual(isSessionExpired(past, 3600), true);
});
