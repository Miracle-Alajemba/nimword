import test from "node:test";
import assert from "node:assert";
import { ERROR_CODES } from "../src/constants/errors.js";

test("defines required error codes", () => {
  assert.strictEqual(ERROR_CODES.INVALID_ROOM, "INVALID_ROOM");
  assert.strictEqual(ERROR_CODES.INVALID_WORD, "INVALID_WORD");
});
