import test from "node:test";
import assert from "node:assert";
import { QWERTY_ROWS } from "./keyboard-layout.js";

test("exports 3 keyboard rows", () => {
  assert.strictEqual(QWERTY_ROWS.length, 3);
});
