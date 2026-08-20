import test from "node:test";
import assert from "node:assert";
import { isMaintenanceActive } from "../src/utils/maintenance-mode.js";

test("evaluates maintenance mode environment flag", () => {
  assert.strictEqual(typeof isMaintenanceActive(), "boolean");
});
