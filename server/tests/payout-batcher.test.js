import test from "node:test";
import assert from "node:assert";
import { batchPayouts } from "../src/utils/payout-batcher.js";

test("bundles payouts into batches", () => {
  const payouts = Array.from({ length: 25 }, (_, i) => ({ id: i }));
  const batches = batchPayouts(payouts, 10);
  assert.strictEqual(batches.length, 3);
});
