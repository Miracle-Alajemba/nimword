import test from "node:test";
import assert from "node:assert";
import { estimateGasFeeCelo } from "../src/utils/tx-fee-estimator.js";

test("estimates transaction gas fee in CELO", () => {
  const fee = estimateGasFeeCelo(100000, 5);
  assert.strictEqual(fee, 0.0005);
});
