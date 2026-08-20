import test from "node:test";
import assert from "node:assert/strict";
import {
  generateRoomCode,
  isValidRoomCode,
} from "../src/utils/room-code-generator.js";

test("generateRoomCode returns a 4-character uppercase alphanumeric code", () => {
  const code = generateRoomCode();
  assert.equal(typeof code, "string");
  assert.equal(code.length, 4);
  assert.equal(isValidRoomCode(code), true);
});

test("isValidRoomCode rejects invalid room code formats", () => {
  assert.equal(isValidRoomCode("A1B2"), true);
  assert.equal(isValidRoomCode("TOO_LONG"), false);
  assert.equal(isValidRoomCode("AB"), false);
  assert.equal(isValidRoomCode(""), false);
  assert.equal(isValidRoomCode(null), false);
});
