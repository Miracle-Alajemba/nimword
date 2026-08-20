import test from "node:test";
import assert from "node:assert";
import { findExpiredRooms } from "../src/utils/room-expiry-cron.js";

test("identifies idle rooms older than cutoff", () => {
  const oldRoom = { id: 1, settled: false, createdAt: new Date(Date.now() - 3600000).toISOString() };
  assert.strictEqual(findExpiredRooms([oldRoom], 30).length, 1);
});
