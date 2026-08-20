import test from "node:test";
import assert from "node:assert";
import { getSystemThemePreference } from "./theme-mode-detector.js";

test("returns theme preference string", () => {
  assert.strictEqual(typeof getSystemThemePreference(), "string");
});
