import test from "node:test";
import assert from "node:assert";
import { mapKeyCodeToLetter } from "./key-code-mapper.js";

test("extracts uppercase letter from KeyA/KeyB", () => {
  assert.strictEqual(mapKeyCodeToLetter("KeyA"), "A");
  assert.strictEqual(mapKeyCodeToLetter("Digit1"), "");
});
