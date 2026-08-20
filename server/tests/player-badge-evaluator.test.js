import test from "node:test";
import assert from "node:assert";
import { checkBadgeUnlock } from "../src/utils/player-badge-evaluator.js";

test("evaluates achievement badge unlock conditions", () => {
  assert.strictEqual(checkBadgeUnlock("SPEED_DEMON", { avgTimeSeconds: 1.2 }), true);
  assert.strictEqual(checkBadgeUnlock("SPEED_DEMON", { avgTimeSeconds: 5.0 }), false);
});
