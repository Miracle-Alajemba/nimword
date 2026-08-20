import test from "node:test";
import assert from "node:assert";
import { RATE_LIMIT_CONFIG } from "../src/utils/rate-limits.js";

test("defines rate limit thresholds", () => {
  assert.strictEqual(RATE_LIMIT_CONFIG.MAX_JOIN_ATTEMPTS > 0, true);
});
