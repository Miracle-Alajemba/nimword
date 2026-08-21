import test, { describe, it } from "node:test";
import assert from "node:assert";
import { capitalizeWord, slugifyText } from "./string-helpers.js";

describe("Client String Helpers Module", () => {
  it("should capitalize first letter of a string", () => {
    assert.strictEqual(capitalizeWord("hello"), "Hello");
    assert.strictEqual(capitalizeWord("WORLD"), "World");
  });

  it("should convert string into slug format", () => {
    assert.strictEqual(slugifyText("NimWord Game Room #1!"), "nimword-game-room-1");
  });
});
