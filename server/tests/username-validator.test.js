import test from "node:test";
import assert from "node:assert/strict";
import { validateAndFormatUsername } from "../src/utils/username-validator.js";

test("validateAndFormatUsername accepts valid usernames", () => {
  const result = validateAndFormatUsername("WordWizard");
  assert.equal(result.valid, true);
  assert.equal(result.formatted, "WordWizard");
});

test("validateAndFormatUsername rejects short or long usernames", () => {
  assert.equal(validateAndFormatUsername("ab").valid, false);
  assert.equal(validateAndFormatUsername("VeryLongUsernameExceeding16Chars").valid, false);
});

test("validateAndFormatUsername filters profanity", () => {
  const result = validateAndFormatUsername("SCAMmer");
  assert.equal(result.valid, true);
  assert.equal(result.formatted, "****mer");
});
