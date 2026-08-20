import test from "node:test";
import assert from "node:assert";
import { toggleFullScreen } from "./fullscreen-helper.js";

test("executes fullscreen toggle safely", () => {
  assert.doesNotThrow(() => toggleFullScreen());
});
