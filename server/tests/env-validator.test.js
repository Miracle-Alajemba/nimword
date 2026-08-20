import test from "node:test";
import assert from "node:assert";
import { validateRequiredEnvVars } from "../src/utils/env-validator.js";

test("identifies missing environment variables", () => {
  const res = validateRequiredEnvVars(["NON_EXISTENT_VAR_123"]);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.missing.includes("NON_EXISTENT_VAR_123"), true);
});
