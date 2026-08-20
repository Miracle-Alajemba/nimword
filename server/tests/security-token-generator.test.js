import test from "node:test";
import assert from "node:assert";
import { signPayload } from "../src/utils/security-token-generator.js";

test("generates HMAC signature string for payload", () => {
  const sig = signPayload({ user: "alice" }, "secret");
  assert.strictEqual(sig.length, 64);
});
