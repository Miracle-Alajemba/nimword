import test from "node:test";
import assert from "node:assert";
import { GAME_RULES } from "./game-rules.js";

test("exports game rule strings array", () => {
  assert.strictEqual(Array.isArray(GAME_RULES), true);
  assert.strictEqual(GAME_RULES.length > 0, true);
});
