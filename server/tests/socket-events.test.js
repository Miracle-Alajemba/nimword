import test from "node:test";
import assert from "node:assert";
import { SOCKET_EVENTS } from "../src/constants/socket-events.js";

test("exports required socket event names", () => {
  assert.strictEqual(SOCKET_EVENTS.JOIN_ROOM, "room:join");
});
