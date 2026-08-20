import test from "node:test";
import assert from "node:assert";
import { CONTRACT_EVENT_NAMES } from "../src/utils/contract-event-names.js";

test("exports smart contract event names", () => {
  assert.strictEqual(CONTRACT_EVENT_NAMES.ROOM_CREATED, "RoomCreated");
});
