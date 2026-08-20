import test from "node:test";
import assert from "node:assert";
import { getLuminance } from "./theme-contrast.js";

test("calculates relative color luminance", () => {
  assert.strictEqual(getLuminance(255, 255, 255), 1);
  assert.strictEqual(getLuminance(0, 0, 0), 0);
});
