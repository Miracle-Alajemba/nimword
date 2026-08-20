import test from "node:test";
import assert from "node:assert";
import { HAPTIC_PATTERNS } from "./haptic-pattern-registry.js";

test("exports haptic vibration pattern registry arrays", () => {
  assert.strictEqual(Array.isArray(HAPTIC_PATTERNS.TILE_TAP), true);
});
