import test from "node:test";
import assert from "node:assert";
import { isSessionExpired } from "../src/utils/session-timeout.js";

test("evaluates if player session has timed out", () => {
  const oldSession = new Date(Date.now() - 3600000).toISOString();
  assert.strictEqual(isSessionExpired(oldSession), true);
});
