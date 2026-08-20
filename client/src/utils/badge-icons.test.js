import test from "node:test";
import assert from "node:assert";
import { BADGE_ICONS } from "./badge-icons.js";

test("exports achievement badge icon mapping", () => {
  assert.strictEqual(BADGE_ICONS.WORD_SMITH, "📚");
});
