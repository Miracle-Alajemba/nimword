import test from "node:test";
import assert from "node:assert";
import { fallbackCopyText } from "./copy-to-clipboard-fallback.js";

test("executes fallback clipboard copy safely", () => {
  assert.strictEqual(typeof fallbackCopyText("test"), "boolean");
});
