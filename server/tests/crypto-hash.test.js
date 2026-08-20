import test from "node:test";
import assert from "node:assert";
import { hashPayload } from "../src/utils/crypto-hash.js";

test("generates consistent sha256 hash", () => {
  const hash1 = hashPayload({ a: 1 });
  const hash2 = hashPayload({ a: 1 });
  assert.strictEqual(hash1, hash2);
});
