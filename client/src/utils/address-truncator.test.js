import { truncateAddress } from "./address-truncator.js";
describe("Address Truncator", () => {
  test("truncates address correctly", () => {
    expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
  });
});
