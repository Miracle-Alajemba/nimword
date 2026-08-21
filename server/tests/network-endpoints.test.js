import test from "node:test";
import assert from "node:assert";
import { NETWORK_ENDPOINTS } from "../src/constants/network-endpoints.js";

test("exports Nimiq Mainnet RPC and explorer URL constants", () => {
  assert.strictEqual(NETWORK_ENDPOINTS.MAINNET_RPC, "https://forno.nimiq.org");
});
