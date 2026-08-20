import test from "node:test";
import assert from "node:assert";
import { getSystemNoticeBanner } from "../src/utils/system-banner.js";

test("returns system notice banner object", () => {
  const banner = getSystemNoticeBanner();
  assert.strictEqual(typeof banner.message, "string");
});
