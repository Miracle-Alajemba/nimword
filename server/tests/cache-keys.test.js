import test from "node:test";
import assert from "node:assert";
import { getRoomCacheKey, getUserCacheKey } from "../src/utils/cache-keys.js";

test("formats redis cache key strings", () => {
  assert.strictEqual(getRoomCacheKey(42), "wordpot:room:42");
  assert.strictEqual(getUserCacheKey("0xABC"), "wordpot:user:0xabc");
});
