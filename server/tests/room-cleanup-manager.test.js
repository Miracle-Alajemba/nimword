import test from "node:test";
import assert from "node:assert";
import { getStaleRooms } from "../src/utils/room-cleanup-manager.js";

test("identifies stale rooms exceeding maximum age", () => {
  const map = new Map();
  map.set(1, { createdAt: new Date(Date.now() - 3600000).toISOString() });
  assert.strictEqual(getStaleRooms(map, 1800000).length, 1);
});
