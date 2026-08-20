/**
 * In-Memory Key-Value TTL Cache Engine for WordPot Server
 */

class TtlCacheEngine {
  constructor(defaultTtlSeconds = 10) {
    this.store = new Map();
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Sets a key-value pair in cache with expiration.
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlSeconds]
   */
  set(key, value, ttlSeconds) {
    const ttlMs = typeof ttlSeconds === "number" ? ttlSeconds * 1000 : this.defaultTtlMs;
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Gets a value from cache if present and not expired.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value;
  }

  /**
   * Deletes a key from cache.
   * @param {string} key
   * @returns {boolean}
   */
  del(key) {
    return this.store.delete(key);
  }

  /**
   * Clears all cached items and resets hit/miss counters.
   */
  flush() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache metrics and hit-ratio.
   * @returns {{ size: number, hits: number, misses: number, hitRatioPercent: number }}
   */
  getMetrics() {
    const total = this.hits + this.misses;
    const ratio = total > 0 ? Number(((this.hits / total) * 100).toFixed(2)) : 0;
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatioPercent: ratio,
    };
  }
}

export const ttlCache = new TtlCacheEngine(10);
export { TtlCacheEngine };
