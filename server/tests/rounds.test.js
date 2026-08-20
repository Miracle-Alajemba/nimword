import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLetterCounts,
  canBuildFromSource,
  deriveValidWords,
} from "../src/rounds.js";

test("buildLetterCounts correctly counts character frequencies", () => {
  const counts = buildLetterCounts("hello");
  assert.deepEqual(counts, { h: 1, e: 1, l: 2, o: 1 });
});

test("canBuildFromSource correctly validates candidate sub-words", () => {
  const source = "SPLENDID";
  assert.equal(canBuildFromSource("LEND", source), true);
  assert.equal(canBuildFromSource("SPINE", source), true);
  assert.equal(canBuildFromSource("SPLENDID", source), true);
  // Rejects word requiring missing letter 'Z'
  assert.equal(canBuildFromSource("ZEBRA", source), false);
  // Rejects word requiring extra 'P' (SPLENDID has only 1 'P')
  assert.equal(canBuildFromSource("APPLE", source), false);
});

test("deriveValidWords returns valid English words formed from source", () => {
  const words = deriveValidWords("BLOCKCHAIN");
  assert.ok(Array.isArray(words));
  assert.ok(words.length > 0);
  // Verify derived words are all constructable from BLOCKCHAIN
  words.forEach((word) => {
    assert.ok(canBuildFromSource(word, "BLOCKCHAIN"), `Word ${word} should be constructable from BLOCKCHAIN`);
  });
});
