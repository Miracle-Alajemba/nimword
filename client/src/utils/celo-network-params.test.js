import test from "node:test";
import assert from "node:assert";
import { CELO_MAINNET_PARAMS } from "./celo-network-params.js";

test("exports valid Celo Mainnet addChain parameters", () => {
  assert.strictEqual(CELO_MAINNET_PARAMS.chainId, "0xa4ec");
});
