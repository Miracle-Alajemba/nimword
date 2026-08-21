import test from "node:test";
import assert from "node:assert";
import { estimateGasFeeNimiq } from "../src/utils/tx-fee-estimator.js";

test("estimates transaction gas fee in NIM", () => {
  const fee = estimateGasFeeNimiq(100000, 5);
  assert.strictEqual(fee, 0.0005);
});
