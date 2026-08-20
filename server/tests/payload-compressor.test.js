import test from "node:test";
import assert from "node:assert";
import { shouldCompressPayload } from "../src/utils/payload-compressor.js";

test("recommends compression for payloads >= 1KB", () => {
  assert.strictEqual(shouldCompressPayload(2048), true);
  assert.strictEqual(shouldCompressPayload(500), false);
});
