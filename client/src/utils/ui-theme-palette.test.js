import test from "node:test";
import assert from "node:assert";
import { DARK_THEME_TOKENS } from "./ui-theme-palette.js";

test("exports dark theme design tokens", () => {
  assert.strictEqual(DARK_THEME_TOKENS.accentMint, "#63f4ca");
});
