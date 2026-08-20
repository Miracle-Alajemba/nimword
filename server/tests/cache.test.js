import test, { describe, it } from "node:test";
import assert from "node:assert";
import { TtlCacheEngine } from "../src/utils/cache.js";

describe("TTL Cache Engine Module", () => {
  it("should store and retrieve non-expired cached values", () => {
    const cache = new TtlCacheEngine(5);
    cache.set("leaderboard", { season: 1, top: ["0x123"] });
    const result = cache.get("leaderboard");
    assert.deepStrictEqual(result, { season: 1, top: ["0x123"] });
  });

  it("should return null for non-existent keys", () => {
    const cache = new TtlCacheEngine(5);
    assert.strictEqual(cache.get("missing_key"), null);
  });

  it("should return null when key has expired", async () => {
    const cache = new TtlCacheEngine(0.05); // 50ms TTL
    cache.set("temp", "val");
    assert.strictEqual(cache.get("temp"), "val");
    await new Promise((resolve) => setTimeout(resolve, 70));
    assert.strictEqual(cache.get("temp"), null);
  });

  it("should delete key correctly", () => {
    const cache = new TtlCacheEngine(10);
    cache.set("key1", "val1");
    assert.strictEqual(cache.del("key1"), true);
    assert.strictEqual(cache.get("key1"), null);
  });

  it("should flush all cached items and reset counters", () => {
    const cache = new TtlCacheEngine(10);
    cache.set("k1", "v1");
    cache.get("k1");
    cache.get("missing");
    cache.flush();
    const metrics = cache.getMetrics();
    assert.strictEqual(metrics.size, 0);
    assert.strictEqual(metrics.hits, 0);
    assert.strictEqual(metrics.misses, 0);
  });

  it("should calculate correct hit ratio percentage", () => {
    const cache = new TtlCacheEngine(10);
    cache.set("k1", "v1");
    cache.get("k1"); // Hit
    cache.get("k1"); // Hit
    cache.get("missing"); // Miss
    const metrics = cache.getMetrics();
    assert.strictEqual(metrics.hits, 2);
    assert.strictEqual(metrics.misses, 1);
    assert.strictEqual(metrics.hitRatioPercent, 66.67);
  });
});
