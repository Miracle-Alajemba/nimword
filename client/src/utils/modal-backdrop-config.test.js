import test from "node:test";
import assert from "node:assert";
import { MODAL_STYLES } from "./modal-backdrop-config.js";

test("exports modal style tokens", () => {
  assert.strictEqual(MODAL_STYLES.backdrop.includes("backdrop-blur"), true);
});
