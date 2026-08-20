import { truncateAddress, isValidAddress, normalizeAddress, addressesEqual } from "../utils/address.js";

describe("address utils", () => {
  test("truncateAddress truncates properly", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(addr)).toBe("0x1234…5678");
  });

  test("isValidAddress validates hex length", () => {
    expect(isValidAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(true);
    expect(isValidAddress("0xinvalid")).toBe(false);
  });

  test("normalizeAddress lowers case", () => {
    expect(normalizeAddress("0xABC")).toBe("0xabc");
  });

  test("addressesEqual compares case-insensitively", () => {
    expect(addressesEqual("0xABC", "0xabc")).toBe(true);
  });
});
