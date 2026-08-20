import test from "node:test";
import assert from "node:assert";
import { formatWalletDisplay } from "./wallet-truncated-display.js";

test("formats connected wallet address or Not Connected state", () => {
  assert.strictEqual(formatWalletDisplay("0x1234567890abcdef1234567890abcdef12345678"), "0x1234...5678");
  assert.strictEqual(formatWalletDisplay(""), "Not Connected");
});
