import test, { describe, it } from "node:test";
import assert from "node:assert";
import { sha256Hash } from "../src/utils/hash-helper.js";

describe("String Hashing Utility Module", () => {
  it("should generate valid 64-character hex SHA-256 hash", () => {
    const hash = sha256Hash("test_input");
    assert.strictEqual(typeof hash, "string");
    assert.strictEqual(hash.length, 64);
  });
});
