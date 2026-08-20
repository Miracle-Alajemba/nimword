import test from "node:test";
import assert from "node:assert";
import { GAME_MODES } from "../src/utils/game-mode-config.js";

test("exports game mode constants", () => {
  assert.strictEqual(GAME_MODES.PRACTICE, "practice");
  assert.strictEqual(GAME_MODES.DAILY_CHALLENGE, "daily");
});
