import test from "node:test";
import assert from "node:assert";
import { formatMatchHistoryRecord } from "../src/utils/room-match-history.js";

test("formats match history record with timestamp", () => {
  const record = formatMatchHistoryRecord(101, "0x123", 150);
  assert.strictEqual(record.roomId, 101);
  assert.strictEqual(typeof record.timestamp, "string");
});
