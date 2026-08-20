import test from "node:test";
import assert from "node:assert";
import { calculateFeeDeduction } from "../src/utils/token-transfer-fee.js";

test("calculates 1% fee from 100 bps", () => {
  assert.strictEqual(calculateFeeDeduction(1000, 100), 10);
});
