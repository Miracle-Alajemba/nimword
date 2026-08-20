import test from "node:test";
import assert from "node:assert";
import { calculateLevelFromXp } from "../src/utils/xp-system.js";

test("calculates player level based on cumulative XP", () => {
  assert.strictEqual(calculateLevelFromXp(0), 1);
  assert.strictEqual(calculateLevelFromXp(400), 3);
});
