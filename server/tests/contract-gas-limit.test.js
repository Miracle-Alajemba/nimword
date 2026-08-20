import test from "node:test";
import assert from "node:assert";
import { getContractFunctionGasLimit } from "../src/utils/contract-gas-limit.js";

test("returns gas limit by function name", () => {
  assert.strictEqual(getContractFunctionGasLimit("joinRoom"), 100000);
  assert.strictEqual(getContractFunctionGasLimit("unknown"), 120000);
});
