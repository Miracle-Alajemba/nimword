import test from "node:test";
import assert from "node:assert";
import { NIMWORD_VERSION } from "../src/utils/game-version-constants.js";

test("exports application semver version metadata constants", () => {
  assert.strictEqual(NIMWORD_VERSION.full, "1.5.0");
});
