import test, { describe, it } from "node:test";
import assert from "node:assert";
import { MemoryRateLimiter } from "../src/utils/rate-limiter.js";

describe("Memory Rate Limiter Module", () => {
  it("should allow requests under the maximum threshold", () => {
    const limiter = new MemoryRateLimiter(1000, 3);
    const res1 = limiter.check("user1");
    assert.strictEqual(res1.isLimited, false);
    assert.strictEqual(res1.remaining, 2);

    const res2 = limiter.check("user1");
    assert.strictEqual(res2.isLimited, false);
    assert.strictEqual(res2.remaining, 1);
  });

  it("should block requests exceeding maximum threshold", () => {
    const limiter = new MemoryRateLimiter(1000, 2);
    limiter.check("user2");
    limiter.check("user2");
    const blocked = limiter.check("user2");
    assert.strictEqual(blocked.isLimited, true);
    assert.strictEqual(blocked.remaining, 0);
  });

  it("should reset rate limit after window expires", async () => {
    const limiter = new MemoryRateLimiter(50, 1); // 50ms window
    limiter.check("user3");
    const blocked = limiter.check("user3");
    assert.strictEqual(blocked.isLimited, true);

    await new Promise((resolve) => setTimeout(resolve, 70));
    const resAfterReset = limiter.check("user3");
    assert.strictEqual(resAfterReset.isLimited, false);
  });
});
