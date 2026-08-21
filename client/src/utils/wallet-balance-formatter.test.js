import test from "node:test";
import assert from "node:assert";
import { formatNimiqBalanceShort } from "./wallet-balance-formatter.js";

test("formats compact NIM balance display string", () => {
  assert.strictEqual(formatNimiqBalanceShort("1000000000000000000"), "1.00 NIM");
  assert.strictEqual(formatNimiqBalanceShort("1500000000000000000000"), "1.5k NIM");
});
