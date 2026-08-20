import test from "node:test";
import assert from "node:assert";
import { getGameStage } from "../src/utils/game-stage-evaluator.js";

test("evaluates game round stage by remaining time ratio", () => {
  assert.strictEqual(getGameStage(40, 60), "early");
  assert.strictEqual(getGameStage(5, 60), "climax");
});
