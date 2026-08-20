import test from "node:test";
import assert from "node:assert";
import { throttleRaf } from "./animation-frame-throttle.js";

test("returns throttled RAF function", () => {
  assert.strictEqual(typeof throttleRaf(() => {}), "function");
});
