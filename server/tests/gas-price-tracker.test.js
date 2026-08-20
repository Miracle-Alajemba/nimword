import test from "node:test";
import assert from "node:assert";
import { formatGweiDisplay } from "../src/utils/gas-price-tracker.js";

test("formats wei amount into Gwei string", () => {
  assert.strictEqual(formatGweiDisplay(5000000000), "5.00 Gwei");
});
