import test from "node:test";
import assert from "node:assert";
import { EVM_CHAIN_IDS } from "../src/constants/network-chain-ids.js";

test("exports Nimiq EVM network chain IDs", () => {
  assert.strictEqual(EVM_CHAIN_IDS.NIM_MAINNET, 42220);
});
