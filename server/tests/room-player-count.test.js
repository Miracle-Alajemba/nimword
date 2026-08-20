import test from "node:test";
import assert from "node:assert";
import { formatPlayerCountDisplay } from "../src/utils/room-player-count.js";

test("formats player count ratio string", () => {
  assert.strictEqual(formatPlayerCountDisplay(2, 4), "2/4 Players");
});
