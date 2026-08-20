import test from "node:test";
import assert from "node:assert";
import { buildOpenGraphCardData } from "./share-card-builder.js";

test("constructs open graph metadata object", () => {
  const og = buildOpenGraphCardData(120, "ROOM42");
  assert.strictEqual(og.title.includes("ROOM42"), true);
});
