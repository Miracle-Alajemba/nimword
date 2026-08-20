import test from "node:test";
import assert from "node:assert";
import { getQueryParam } from "./url-param-extractor.js";

test("extracts room query parameter from URL string", () => {
  assert.strictEqual(getQueryParam("room", "?room=ROOM42"), "ROOM42");
});
