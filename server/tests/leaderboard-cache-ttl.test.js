import test from "node:test";
import assert from "node:assert";
import { isCacheStale } from "../src/utils/leaderboard-cache-ttl.js";

test("evaluates cache freshness", () => {
  const oldDate = new Date(Date.now() - 120000).toISOString();
  assert.strictEqual(isCacheStale(oldDate, 60000), true);
});
