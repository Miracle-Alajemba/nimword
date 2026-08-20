import test from "node:test";
import assert from "node:assert";
import { BUILD_INFO } from "../src/utils/app-build-info.js";

test("exports server build metadata provider", () => {
  assert.strictEqual(BUILD_INFO.targetChain, "Celo Mainnet");
});
