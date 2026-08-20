import test from "node:test";
import assert from "node:assert";
import { getToastDismissTimeout } from "./toast-auto-dismiss.js";

test("returns dismiss timeout based on toast notification type", () => {
  assert.strictEqual(getToastDismissTimeout("error"), 5000);
  assert.strictEqual(getToastDismissTimeout("success"), 3000);
});
