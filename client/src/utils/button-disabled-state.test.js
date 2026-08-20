import test from "node:test";
import assert from "node:assert";
import { getSubmitButtonText } from "./button-disabled-state.js";

test("returns button text based on busy and input state", () => {
  assert.strictEqual(getSubmitButtonText(true, "CAT"), "Processing...");
  assert.strictEqual(getSubmitButtonText(false, "CAT"), "Claim Word");
});
