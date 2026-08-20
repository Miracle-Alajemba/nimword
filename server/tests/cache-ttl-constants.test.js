import test from "node:test";
import assert from "node:assert";
import { CACHE_TTL_SECONDS } from "../src/utils/cache-ttl-constants.js";

test("exports cache TTL constants", () => {
  assert.strictEqual(CACHE_TTL_SECONDS.LEADERBOARD, 30);
});
