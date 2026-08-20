import test from "node:test";
import assert from "node:assert";
import { APP_MANIFEST_INFO } from "./app-manifest-info.js";

test("exports PWA manifest metadata constants", () => {
  assert.strictEqual(APP_MANIFEST_INFO.name, "WordPot Arena");
});
