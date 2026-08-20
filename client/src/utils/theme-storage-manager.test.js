import test from "node:test";
import assert from "node:assert";
import { getSavedTheme } from "./theme-storage-manager.js";

test("returns default or saved theme preference string", () => {
  assert.strictEqual(getSavedTheme("dark"), "dark");
});
