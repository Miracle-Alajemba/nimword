import test from "node:test";
import assert from "node:assert";
import { WORDPOT_VERSION } from "../src/utils/game-version-constants.js";

test("exports application semver version metadata constants", () => {
  assert.strictEqual(WORDPOT_VERSION.full, "1.5.0");
});
