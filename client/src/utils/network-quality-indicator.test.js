import test from "node:test";
import assert from "node:assert";
import { getPingQualityBadge } from "./network-quality-indicator.js";

test("categorizes network ping latency status", () => {
  assert.strictEqual(getPingQualityBadge(40).status, "Excellent");
});
