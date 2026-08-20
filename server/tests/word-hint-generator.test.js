import test from "node:test";
import assert from "node:assert";
import { generateWordHint } from "../src/utils/word-hint-generator.js";

test("masks middle letters of word hint", () => {
  assert.strictEqual(generateWordHint("apple"), "a___e");
});
