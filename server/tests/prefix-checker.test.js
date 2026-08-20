import test from "node:test";
import assert from "node:assert";
import { isValidPrefix } from "../src/utils/prefix-checker.js";

test("checks if prefix exists in word list", () => {
  assert.strictEqual(isValidPrefix("app", ["apple", "banana"]), true);
  assert.strictEqual(isValidPrefix("xyz", ["apple"]), false);
});
