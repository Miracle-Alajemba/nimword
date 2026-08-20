import test from "node:test";
import assert from "node:assert";
import { isSessionActive } from "../src/utils/game-session-validator.js";

test("validates whether game session is actively running", () => {
  assert.strictEqual(isSessionActive({ status: "active", endedAt: null }), true);
  assert.strictEqual(isSessionActive({ status: "finished" }), false);
});
