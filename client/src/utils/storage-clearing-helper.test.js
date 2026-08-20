import test from "node:test";
import assert from "node:assert";
import { clearGameCache } from "./storage-clearing-helper.js";

test("clears game cache storage safely", () => {
  assert.doesNotThrow(() => clearGameCache());
});
