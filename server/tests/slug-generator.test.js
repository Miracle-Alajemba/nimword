import test from "node:test";
import assert from "node:assert";
import { generateSlug } from "../src/utils/slug-generator.js";

test("converts text to URL slug", () => {
  assert.strictEqual(generateSlug("WordPot Arena Daily!"), "wordpot-arena-daily");
});
