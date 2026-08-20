import test from "node:test";
import assert from "node:assert";
import { retryWithBackoff } from "../src/utils/retry-handler.js";

test("resolves on first successful call", async () => {
  let count = 0;
  const fn = async () => { count++; return "ok"; };
  const res = await retryWithBackoff(fn);
  assert.strictEqual(res, "ok");
  assert.strictEqual(count, 1);
});
