import test from "node:test";
import assert from "node:assert";
import { getSystemHealthStatus } from "../src/utils/health-check.js";

test("returns health metrics object", () => {
  const health = getSystemHealthStatus();
  assert.strictEqual(health.status, "ok");
  assert.strictEqual(health.uptime >= 0, true);
});
