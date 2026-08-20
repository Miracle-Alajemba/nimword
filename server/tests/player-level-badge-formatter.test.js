import test from "node:test";
import assert from "node:assert";
import { formatLevelBadge } from "../src/utils/player-level-badge-formatter.js";

test("formats player level badge string", () => {
  assert.strictEqual(formatLevelBadge(10), "Lvl 10");
});
