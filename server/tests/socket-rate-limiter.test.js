import test from "node:test";
import assert from "node:assert";
import { SocketRateLimiter } from "../src/utils/socket-rate-limiter.js";

test("allows packets under threshold and blocks overflow", () => {
  const limiter = new SocketRateLimiter(2, 1000);
  assert.strictEqual(limiter.allow("s1"), true);
  assert.strictEqual(limiter.allow("s1"), true);
  assert.strictEqual(limiter.allow("s1"), false);
});
