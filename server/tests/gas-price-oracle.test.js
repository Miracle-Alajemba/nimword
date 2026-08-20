import test from "node:test";
import assert from "node:assert";
import { addGasBuffer } from "../src/utils/gas-price-oracle.js";

test("adds safety buffer to gas price", () => {
  assert.strictEqual(addGasBuffer(10, 20), 12);
});
