import test, { describe, it } from "node:test";
import assert from "node:assert";
import { getThemeColor } from "./theme-tokens.js";

describe("Theme Tokens Utility", () => {
  it("should return correct primary theme color", () => {
    assert.strictEqual(getThemeColor("primary"), "#10b981");
  });

  it("should return fallback color for invalid tier", () => {
    assert.strictEqual(getThemeColor("unknown"), "#10b981");
  });
});
