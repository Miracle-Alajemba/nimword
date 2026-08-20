import test from "node:test";
import assert from "node:assert";
import { SECURITY_HEADERS } from "../src/utils/security-header-config.js";

test("exports HTTP security response header constants", () => {
  assert.strictEqual(SECURITY_HEADERS["X-Frame-Options"], "DENY");
});
