import test from "node:test";
import assert from "node:assert";
import { NIM_MAINNET_PARAMS } from "./nimiq-network-params.js";

test("exports valid Nimiq Mainnet addChain parameters", () => {
  assert.strictEqual(NIM_MAINNET_PARAMS.chainId, "0xa4ec");
});
