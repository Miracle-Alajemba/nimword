import test from "node:test";
import assert from "node:assert";
import { buildRoomInviteLink } from "../src/utils/game-room-invite-builder.js";

test("constructs room invite URL link", () => {
  assert.strictEqual(buildRoomInviteLink("ROOM1"), "https://wordpot.app/join?code=ROOM1");
});
