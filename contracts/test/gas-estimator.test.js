import test from "node:test";
import assert from "node:assert";
import { estimateRoomCreationGas } from "../scripts/gas-estimator.js";

test("calculates gas estimate with 10% buffer", () => {
  assert.strictEqual(estimateRoomCreationGas(100000, 10), 110000);
});
