import { CONTRACT_ADDRESSES } from "../scripts/contract-info.js";
describe("Contract Address Registry", () => {
  test("contains valid EVM addresses", () => {
    expect(CONTRACT_ADDRESSES.DAILY_CHALLENGE).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });
});
