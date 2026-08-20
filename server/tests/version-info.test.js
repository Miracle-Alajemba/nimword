import test from "node:test";
import assert from "node:assert";
import { APP_VERSION_INFO } from "../src/utils/version-info.js";

test("exports application version details", () => {
  assert.strictEqual(APP_VERSION_INFO.version, "1.4.0");
  assert.strictEqual(APP_VERSION_INFO.network, "Celo Mainnet");
});
