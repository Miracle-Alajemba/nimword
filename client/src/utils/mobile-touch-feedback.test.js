import test from "node:test";
import assert from "node:assert";
import { applyTileTapEffect } from "./mobile-touch-feedback.js";

test("applies tile tap CSS class safely", () => {
  assert.doesNotThrow(() => applyTileTapEffect(null));
});
