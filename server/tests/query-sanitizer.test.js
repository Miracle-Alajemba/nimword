import test from "node:test";
import assert from "node:assert";
import { escapeSearchQuery } from "../src/utils/query-sanitizer.js";

test("escapes wildcard characters in query string", () => {
  assert.strictEqual(escapeSearchQuery("100%_pure"), "100\\%\\_pure");
});
