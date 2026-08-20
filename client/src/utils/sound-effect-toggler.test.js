import test from "node:test";
import assert from "node:assert";
import { isSoundEffectEnabled } from "./sound-effect-toggler.js";

test("evaluates whether sound effects are enabled", () => {
  assert.strictEqual(isSoundEffectEnabled({ soundEffects: true, muted: false }), true);
  assert.strictEqual(isSoundEffectEnabled({ muted: true }), false);
});
