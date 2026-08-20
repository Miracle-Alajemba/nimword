import { simpleHash } from "../utils/crypto.js";

describe("crypto utils", () => {
  test("simpleHash produces string hex", () => {
    expect(typeof simpleHash("test")).toBe("string");
  });
});
