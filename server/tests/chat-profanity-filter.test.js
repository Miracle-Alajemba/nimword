import test from "node:test";
import assert from "node:assert";
import { filterChatMessage } from "../src/utils/chat-profanity-filter.js";

test("filters blocked words in chat message", () => {
  assert.strictEqual(filterChatMessage("dont spam here"), "dont *** here");
});
