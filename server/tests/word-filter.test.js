import test from "node:test";
import assert from "node:assert/strict";
import { filterProfanity, containsProfanity } from "../src/utils/word-filter.js";

test("filterProfanity replaces blocked words with asterisks", () => {
  assert.equal(filterProfanity("This is a SCAM attempt"), "This is a **** attempt");
  assert.equal(filterProfanity("Clean message"), "Clean message");
});

test("containsProfanity detects blocked words", () => {
  assert.equal(containsProfanity("Watch out for SPAM"), true);
  assert.equal(containsProfanity("Hello World"), false);
});
