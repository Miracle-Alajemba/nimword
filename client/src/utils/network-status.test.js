import test from "node:test";
import assert from "node:assert";
import { isOnline } from "./network-status.js";

test("returns boolean for online status check", () => {
  assert.strictEqual(typeof isOnline(), "boolean");
});
