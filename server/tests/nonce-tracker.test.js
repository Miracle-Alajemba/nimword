import test from "node:test";
import assert from "node:assert";
import { NonceTracker } from "../src/utils/nonce-tracker.js";

test("increments nonce sequentially", () => {
  const tracker = new NonceTracker(10);
  assert.strictEqual(tracker.next(), 10);
  assert.strictEqual(tracker.current(), 11);
});
