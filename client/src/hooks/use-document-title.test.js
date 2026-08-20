import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useDocumentTitle Hook Module", () => {
  it("should exports valid hook module function", async () => {
    const { useDocumentTitle } = await import("./use-document-title.js");
    assert.strictEqual(typeof useDocumentTitle, "function");
  });
});
