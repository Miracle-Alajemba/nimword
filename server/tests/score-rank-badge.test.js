import test from "node:test";
import assert from "node:assert";
import { getScoreBadge } from "../src/utils/score-rank-badge.js";

test("maps score to rank badge title", () => {
  assert.strictEqual(getScoreBadge(600), "🥇 Legend");
  assert.strictEqual(getScoreBadge(50), "🌱 Novice");
});
