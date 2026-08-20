import test from "node:test";
import assert from "node:assert";
import { buildRateLimitHeaders } from "../src/utils/api-rate-limit-headers.js";

test("builds rate limit HTTP header object", () => {
  const headers = buildRateLimitHeaders(100, 50, 30);
  assert.strictEqual(headers["X-RateLimit-Remaining"], "50");
});
