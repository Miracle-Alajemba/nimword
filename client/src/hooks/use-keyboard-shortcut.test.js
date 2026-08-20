import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useKeyboardShortcut Hook Module", () => {
  it("should export valid hook module function", async () => {
    const { useKeyboardShortcut } = await import("./use-keyboard-shortcut.js");
    assert.strictEqual(typeof useKeyboardShortcut, "function");
  });
});
