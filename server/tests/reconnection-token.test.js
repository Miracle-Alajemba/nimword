import test from "node:test";
import assert from "node:assert";
import { generateReconnectToken } from "../src/utils/reconnection-token.js";

test("generates 16-character hex reconnect token", () => {
  const token = generateReconnectToken("s123", "0x123");
  assert.strictEqual(token.length, 16);
});
