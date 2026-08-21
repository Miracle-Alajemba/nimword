import test from "node:test";
import assert from "node:assert";
import { isNimiqPayUserAgent } from "../src/utils/minipay-user-agent.js";

test("detects Nimiq Pay User Agent header", () => {
  assert.strictEqual(isNimiqPayUserAgent("Mozilla/5.0 NimiqPay/1.0"), true);
  assert.strictEqual(isNimiqPayUserAgent("Mozilla/5.0 Chrome/120"), false);
});
