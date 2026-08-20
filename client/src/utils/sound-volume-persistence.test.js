import test from "node:test";
import assert from "node:assert";
import { saveVolumeSetting } from "./sound-volume-persistence.js";

test("persists volume setting without error", () => {
  assert.doesNotThrow(() => saveVolumeSetting(75));
});
