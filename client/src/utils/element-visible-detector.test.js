import test from "node:test";
import assert from "node:assert";
import { isElementInViewport } from "./element-visible-detector.js";

test("evaluates element viewport visibility safely", () => {
  assert.strictEqual(isElementInViewport(null), false);
});
