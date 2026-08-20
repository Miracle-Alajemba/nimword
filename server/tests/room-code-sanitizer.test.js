import test from "node:test";
import assert from "node:assert";
import { sanitizeRoomCodeInput } from "../src/utils/room-code-sanitizer.js";

test("strips invalid characters and truncates room code to 6 chars", () => {
  assert.strictEqual(sanitizeRoomCodeInput(" room-123! "), "ROOM12");
});
