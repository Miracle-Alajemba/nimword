import test from "node:test";
import assert from "node:assert";
import { getCopyToastMessage } from "./copy-link-toast.js";

test("returns success and failure toast strings", () => {
  assert.strictEqual(getCopyToastMessage(true).includes("copied"), true);
});
