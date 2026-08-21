import { isNimiqMainnet } from "./network-detector.js";
describe("Network Detector", () => {
  test("detects Nimiq Mainnet chain ID 42220", () => {
    expect(isNimiqMainnet(42220)).toBe(true);
    expect(isNimiqMainnet(1)).toBe(false);
  });
});
