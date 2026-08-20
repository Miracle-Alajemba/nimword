import test from "node:test";
import assert from "node:assert";
import { generateRoomCode } from "../src/utils/room-code-generator.js";

test("generates room code of correct length", () => {
  const code = generateRoomCode(4);
  assert.strictEqual(code.length, 4);
  assert.strictEqual(/^[A-Z2-9]+$/.test(code), true);
});
