import test from "node:test";
import assert from "node:assert";
import { generateBragText } from "./share-text-generator.js";

test("generates share text with score and word count", () => {
  const text = generateBragText(150, 8);
  assert.strictEqual(text.includes("150 pts"), true);
});
