import test from "node:test";
import assert from "node:assert";
import { getRoomStatusBadge } from "../src/utils/room-status-badge.js";

test("returns status badge label and color for room state", () => {
  assert.strictEqual(getRoomStatusBadge({ settled: false, playerCount: 1 }).label, "Open");
  assert.strictEqual(getRoomStatusBadge({ settled: true }).label, "Completed");
});
