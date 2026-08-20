import test from "node:test";
import assert from "node:assert";
import { hasInjectedWeb3 } from "./web3-provider-detector.js";

test("returns boolean for injected Web3 provider check", () => {
  assert.strictEqual(typeof hasInjectedWeb3(), "boolean");
});
