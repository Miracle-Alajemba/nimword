import test from "node:test";
import assert from "node:assert";
import { getServerTimestamp } from "../src/utils/server-time.js";

test("returns current unix timestamp in milliseconds", () => {
  assert.strictEqual(typeof getServerTimestamp(), "number");
  assert.strictEqual(getServerTimestamp() > 0, true);
});
