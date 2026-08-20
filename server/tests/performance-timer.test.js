import test from "node:test";
import assert from "node:assert";
import { measureExecutionTime } from "../src/utils/performance-timer.js";

test("measures function execution duration", () => {
  const res = measureExecutionTime(() => 1 + 1);
  assert.strictEqual(res.result, 2);
  assert.strictEqual(res.duration >= 0, true);
});
