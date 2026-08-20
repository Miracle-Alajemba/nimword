import test from "node:test";
import assert from "node:assert";
import { isSocketAlive } from "../src/utils/socket-heartbeat.js";

test("evaluates socket heartbeat liveness", () => {
  const recent = new Date().toISOString();
  assert.strictEqual(isSocketAlive(recent, 30000), true);
});
