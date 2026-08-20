import test from "node:test";
import assert from "node:assert";
import { TrieNode } from "../src/utils/trie-node.js";

test("initializes empty trie node", () => {
  const node = new TrieNode();
  assert.strictEqual(node.isEndOfWord, false);
  assert.deepStrictEqual(node.children, {});
});
