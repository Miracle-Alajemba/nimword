import test from "node:test";
import assert from "node:assert";
import { calculateEloChange } from "../src/utils/elo-calculator.js";

test("calculates positive Elo change for win against equal opponent", () => {
  const change = calculateEloChange(1000, 1000, 1);
  assert.strictEqual(change, 16);
});
