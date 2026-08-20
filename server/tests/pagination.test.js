import test from "node:test";
import assert from "node:assert";
import { paginate } from "../src/utils/pagination.js";

test("paginates array items correctly", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);
  const result = paginate(items, 2, 10);
  assert.strictEqual(result.data.length, 10);
  assert.strictEqual(result.totalPages, 3);
});
