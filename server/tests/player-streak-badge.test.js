import test from "node:test";
import assert from "node:assert";
import { formatStreakBadge } from "../src/utils/player-streak-badge.js";

test("formats streak badge text with emoji icon", () => {
  assert.strictEqual(formatStreakBadge(7), "🔥 7 Days");
  assert.strictEqual(formatStreakBadge(1), "⚡ 1 Day");
});
