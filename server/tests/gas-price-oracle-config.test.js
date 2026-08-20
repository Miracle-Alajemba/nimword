import test from "node:test";
import assert from "node:assert";
import { GAS_ORACLE_THRESHOLDS } from "../src/utils/gas-price-oracle-config.js";

test("exports gas price oracle Gwei thresholds", () => {
  assert.strictEqual(GAS_ORACLE_THRESHOLDS.LOW_GWEI, 5);
});
