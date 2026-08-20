import test from "node:test";
import assert from "node:assert";
import { EVM_CHAIN_IDS } from "../src/constants/network-chain-ids.js";

test("exports Celo EVM network chain IDs", () => {
  assert.strictEqual(EVM_CHAIN_IDS.CELO_MAINNET, 42220);
});
