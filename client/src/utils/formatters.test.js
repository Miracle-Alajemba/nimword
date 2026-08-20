import { formatCelo } from "./formatters.js";
describe("Client Formatters", () => {
  test("formats wei to CELO string", () => {
    expect(formatCelo("1000000000000000000")).toBe("1.0000 CELO");
  });
});
