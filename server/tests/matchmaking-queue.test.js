import test from "node:test";
import assert from "node:assert";
import { findMatchInQueue } from "../src/utils/matchmaking-queue.js";

test("finds opponent within rating tolerance", () => {
  const queue = [{ id: "1", rating: 1050 }];
  assert.strictEqual(findMatchInQueue(queue, 1000)?.id, "1");
});
