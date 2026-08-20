import test from "node:test";
import assert from "node:assert";
import { saveMuteState } from "./sound-mute-storage.js";

test("persists sound mute state safely", () => {
  assert.doesNotThrow(() => saveMuteState(true));
});
