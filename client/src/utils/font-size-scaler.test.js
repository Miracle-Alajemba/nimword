import test from "node:test";
import assert from "node:assert";
import { getResponsiveFontSize } from "./font-size-scaler.js";

test("scales font size when large text setting enabled", () => {
  assert.strictEqual(getResponsiveFontSize(1, true), "1.2rem");
  assert.strictEqual(getResponsiveFontSize(1, false), "1rem");
});
