import test from "node:test";
import assert from "node:assert";
import { formatTimeAgo } from "./time-ago.js";

test("formats relative time strings", () => {
  assert.strictEqual(formatTimeAgo(Date.now()), "just now");
});
