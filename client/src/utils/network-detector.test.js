import { isCeloMainnet } from "./network-detector.js";
describe("Network Detector", () => {
  test("detects Celo Mainnet chain ID 42220", () => {
    expect(isCeloMainnet(42220)).toBe(true);
    expect(isCeloMainnet(1)).toBe(false);
  });
});
