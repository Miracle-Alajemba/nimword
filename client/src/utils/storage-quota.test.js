import test from "node:test";
import assert from "node:assert";
import { getStorageQuotaInfo } from "./storage-quota.js";

test("returns storage estimate object safely", async () => {
  const info = await getStorageQuotaInfo();
  assert.strictEqual(typeof info.quota, "number");
});
