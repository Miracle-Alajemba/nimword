import test from "node:test";
import assert from "node:assert";
import { toggleMuteState } from "./sound-mute-toggle.js";

test("toggles muted state boolean", () => {
  assert.strictEqual(toggleMuteState(false), true);
  assert.strictEqual(toggleMuteState(true), false);
});
