import test from "node:test";
import assert from "node:assert";
import { formatDailyStats } from "../src/utils/daily-challenge-stats.js";

test("constructs daily challenge summary object", () => {
  const stats = formatDailyStats(42, "0.05");
  assert.strictEqual(stats.claimedCount, 42);
});
