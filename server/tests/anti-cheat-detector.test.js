import test from "node:test";
import assert from "node:assert";
import { isSubmissionPlausible } from "../src/utils/anti-cheat-detector.js";

test("flags implausibly fast word submissions", () => {
  assert.strictEqual(isSubmissionPlausible(10, 60), true);
  assert.strictEqual(isSubmissionPlausible(100, 5), false);
});
