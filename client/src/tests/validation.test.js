import { isAlphaOnly, isValidWordLength, sanitizeInput, isValidRoomCode } from "../utils/validation.js";

describe("validation utils", () => {
  test("isAlphaOnly validates letters", () => {
    expect(isAlphaOnly("WORD")).toBe(true);
    expect(isAlphaOnly("W0RD")).toBe(false);
  });

  test("isValidWordLength checks bounds", () => {
    expect(isValidWordLength("CAT")).toBe(true);
    expect(isValidWordLength("HI")).toBe(false);
  });

  test("sanitizeInput strips whitespace and non-printable chars", () => {
    expect(sanitizeInput("  test  ")).toBe("test");
  });

  test("isValidRoomCode validates code string", () => {
    expect(isValidRoomCode("room_123")).toBe(true);
    expect(isValidRoomCode("a")).toBe(false);
  });
});
