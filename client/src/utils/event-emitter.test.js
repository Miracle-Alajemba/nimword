import test from "node:test";
import assert from "node:assert";
import { EventEmitter } from "./event-emitter.js";

test("emits events to registered listeners", () => {
  const emitter = new EventEmitter();
  let called = false;
  emitter.on("test", () => { called = true; });
  emitter.emit("test");
  assert.strictEqual(called, true);
});
