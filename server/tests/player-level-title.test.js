import test from "node:test";
import assert from "node:assert";
import { getLevelTitle } from "../src/utils/player-level-title.js";

test("returns player title based on level", () => {
  assert.strictEqual(getLevelTitle(55), "Grandmaster Lexicon");
  assert.strictEqual(getLevelTitle(1), "Word Apprentice");
});
