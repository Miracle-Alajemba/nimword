import test from "node:test";
import assert from "node:assert";
import { generateMiniPayAuthNonce } from "../src/utils/minipay-auth-token.js";

test("generates SHA-256 auth nonce for MiniPay wallet", () => {
  const nonce = generateMiniPayAuthNonce("0x123");
  assert.strictEqual(nonce.length, 64);
});
