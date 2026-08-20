import test from "node:test";
import assert from "node:assert";
import { CONFETTI_DEFAULTS } from "./confetti-config.js";

test("exports confetti particle configuration", () => {
  assert.strictEqual(CONFETTI_DEFAULTS.particleCount, 80);
});
