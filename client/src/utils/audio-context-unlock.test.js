import test from "node:test";
import assert from "node:assert";
import { unlockAudioContext } from "./audio-context-unlock.js";

test("resumes audio context safely", () => {
  assert.doesNotThrow(() => unlockAudioContext(null));
});
