import test from "node:test";
import assert from "node:assert";
import { successResponse, errorResponse } from "../src/utils/response-formatter.js";

test("formats success and error responses", () => {
  assert.deepStrictEqual(successResponse({ id: 1 }), { success: true, message: "Success", data: { id: 1 } });
  assert.deepStrictEqual(errorResponse("Invalid", 404), { success: false, error: "Invalid", code: 404 });
});
