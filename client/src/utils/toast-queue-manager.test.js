import test from "node:test";
import assert from "node:assert";
import { addToastToQueue } from "./toast-queue-manager.js";

test("limits toast queue length to maxToasts limit", () => {
  const queue = addToastToQueue([1, 2, 3], 4, 3);
  assert.strictEqual(queue.length, 3);
  assert.strictEqual(queue[2], 4);
});
