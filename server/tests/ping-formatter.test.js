import test from "node:test";
import assert from "node:assert";
import { formatPingLatency } from "../src/utils/ping-formatter.js";

test("categorizes network ping latency", () => {
  assert.strictEqual(formatPingLatency(30).label, "Excellent");
  assert.strictEqual(formatPingLatency(200).label, "Poor");
});
