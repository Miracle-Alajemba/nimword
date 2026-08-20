import test from "node:test";
import assert from "node:assert";
import { formatClipboardSuccessToast } from "./clipboard-toast-formatter.js";

test("constructs clipboard success toast string", () => {
  assert.strictEqual(formatClipboardSuccessToast("Address").includes("Address"), true);
});
