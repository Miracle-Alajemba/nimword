import test from "node:test";
import assert from "node:assert";
import { formatDateIsoShort } from "./date-formatter.js";

test("formats date into YYYY-MM-DD string", () => {
  assert.strictEqual(formatDateIsoShort("2026-07-28T12:00:00Z"), "2026-07-28");
});
