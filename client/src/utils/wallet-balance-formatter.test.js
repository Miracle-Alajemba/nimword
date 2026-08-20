import test from "node:test";
import assert from "node:assert";
import { formatCeloBalanceShort } from "./wallet-balance-formatter.js";

test("formats compact CELO balance display string", () => {
  assert.strictEqual(formatCeloBalanceShort("1000000000000000000"), "1.00 CELO");
  assert.strictEqual(formatCeloBalanceShort("1500000000000000000000"), "1.5k CELO");
});
