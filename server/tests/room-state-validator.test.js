import test from "node:test";
import assert from "node:assert";
import { isRoomJoinable } from "../src/utils/room-state-validator.js";

test("validates whether room accepts new players", () => {
  assert.strictEqual(isRoomJoinable({ settled: false, cancelled: false, playerCount: 1, maxPlayers: 4 }), true);
  assert.strictEqual(isRoomJoinable({ settled: true }), false);
});
