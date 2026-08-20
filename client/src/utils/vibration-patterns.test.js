import test from "node:test";
import assert from "node:assert";
import { VIBRATION_PATTERNS } from "./vibration-patterns.js";

test("exports vibration pattern arrays", () => {
  assert.strictEqual(Array.isArray(VIBRATION_PATTERNS.SUCCESS), true);
});
