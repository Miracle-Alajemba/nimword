import test from "node:test";
import assert from "node:assert";
import { containsSubword } from "../src/utils/dictionary-trie-search.js";

test("validates candidate subwords against source letter pool", () => {
  assert.strictEqual(containsSubword("APPLE", "LAP"), true);
  assert.strictEqual(containsSubword("APPLE", "BANANA"), false);
});
