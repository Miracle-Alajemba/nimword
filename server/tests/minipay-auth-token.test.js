import test from "node:test";
import assert from "node:assert";
import { generateNimiqPayAuthNonce } from "../src/utils/minipay-auth-token.js";

test("generates SHA-256 auth nonce for Nimiq Pay wallet", () => {
  const nonce = generateNimiqPayAuthNonce("NQ1234567890");
  assert.strictEqual(nonce.length, 64);
});
