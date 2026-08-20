import test from "node:test";
import assert from "node:assert";
import { formatCountdown } from "../src/utils/time-helpers.js";

test("formats seconds into MM:SS string", () => {
  assert.strictEqual(formatCountdown(65), "01:05");
  assert.strictEqual(formatCountdown(0), "00:00");
});
