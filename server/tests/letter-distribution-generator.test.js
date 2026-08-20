import test from "node:test";
import assert from "node:assert";
import { drawWeightedLetter } from "../src/utils/letter-distribution-generator.js";

test("draws a valid single uppercase letter", () => {
  const letter = drawWeightedLetter();
  assert.strictEqual(/^[A-Z]$/.test(letter), true);
});
