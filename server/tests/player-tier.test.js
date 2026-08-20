import test from "node:test";
import assert from "node:assert";
import { getPlayerTier } from "../src/utils/player-tier.js";

test("evaluates rating into tier name", () => {
  assert.strictEqual(getPlayerTier(2500), "Diamond");
  assert.strictEqual(getPlayerTier(1100), "Bronze");
});
