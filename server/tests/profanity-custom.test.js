import test from "node:test";
import assert from "node:assert";
import { containsCustomBlocked } from "../src/utils/profanity-custom.js";

test("detects security blocked words", () => {
  assert.strictEqual(containsCustomBlocked("this is a scam!"), true);
  assert.strictEqual(containsCustomBlocked("hello world"), false);
});
