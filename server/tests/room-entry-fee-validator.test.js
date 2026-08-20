import test from "node:test";
import assert from "node:assert";
import { isValidEntryFee } from "../src/utils/room-entry-fee-validator.js";

test("validates non-negative entry fee in wei", () => {
  assert.strictEqual(isValidEntryFee("1000000000000000000"), true);
  assert.strictEqual(isValidEntryFee("-100"), false);
});
