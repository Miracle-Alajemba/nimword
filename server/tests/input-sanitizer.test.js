import test from "node:test";
import assert from "node:assert";
import { sanitizeUsername } from "../src/utils/input-sanitizer.js";

test("strips illegal characters and truncates username", () => {
  assert.strictEqual(sanitizeUsername("<b>Player1</b>"), "Player1");
  assert.strictEqual(sanitizeUsername("a".repeat(30)).length, 20);
});
