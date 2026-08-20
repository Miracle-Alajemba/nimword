import test from "node:test";
import assert from "node:assert";
import { TOAST_ICONS } from "./toast-type-icons.js";

test("exports toast alert icon mapping", () => {
  assert.strictEqual(TOAST_ICONS.success, "✅");
});
