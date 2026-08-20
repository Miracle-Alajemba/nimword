import test from "node:test";
import assert from "node:assert";
import { GAMEPLAY_SHORTCUTS } from "./keyboard-shortcut-registry.js";

test("exports gameplay key binding constants", () => {
  assert.strictEqual(GAMEPLAY_SHORTCUTS.SUBMIT, "Enter");
});
