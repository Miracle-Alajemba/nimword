/**
 * In-Memory Request Rate Limiter Utility for WordPot Server
 */

class MemoryRateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map();
  }

  /**
   * Checks if an IP or key has exceeded rate limits.
   * @param {string} key
   * @returns {{ isLimited: boolean, remaining: number, resetMs: number }}
   */
  check(key) {
    const now = Date.now();
    const record = this.hits.get(key) || { count: 0, resetTime: now + this.windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    record.count++;
    this.hits.set(key, record);

    const isLimited = record.count > this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetMs = Math.max(0, record.resetTime - now);

    return { isLimited, remaining, resetMs };
  }

  /**
   * Clears expired key records to free memory.
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now > record.resetTime) {
        this.hits.delete(key);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter(60000, 100);
export { MemoryRateLimiter };
