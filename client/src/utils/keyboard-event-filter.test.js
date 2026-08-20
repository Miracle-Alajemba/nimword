import test from "node:test";
import assert from "node:assert";
import { isSpecialNavKey } from "./keyboard-event-filter.js";

test("filters out non-gameplay modifier keys", () => {
  assert.strictEqual(isSpecialNavKey("Tab"), true);
  assert.strictEqual(isSpecialNavKey("a"), false);
});
