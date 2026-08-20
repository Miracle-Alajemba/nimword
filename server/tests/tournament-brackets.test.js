import test from "node:test";
import assert from "node:assert";
import { generateBracketPairs } from "../src/utils/tournament-brackets.js";

test("pairs players for tournament match brackets", () => {
  const pairs = generateBracketPairs(["P1", "P2", "P3", "P4"]);
  assert.strictEqual(pairs.length, 2);
  assert.deepStrictEqual(pairs[0], ["P1", "P2"]);
});
