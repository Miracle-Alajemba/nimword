import test from "node:test";
import assert from "node:assert";
import { isMiniPayUserAgent } from "../src/utils/minipay-user-agent.js";

test("detects MiniPay string in User-Agent header", () => {
  assert.strictEqual(isMiniPayUserAgent("Mozilla/5.0 (Linux; Android 10; MiniPay)"), true);
  assert.strictEqual(isMiniPayUserAgent("Mozilla/5.0 (Windows NT 10.0)"), false);
});
