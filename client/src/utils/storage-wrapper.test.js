import test, { describe, it } from "node:test";
import assert from "node:assert";
import { safeStorage } from "./storage-wrapper.js";

describe("Safe LocalStorage Wrapper Utility", () => {
  it("should safely handle storage getItem when window is undefined", () => {
    const val = safeStorage.getItem("test_key");
    assert.strictEqual(val, null);
  });
});
