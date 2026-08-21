import { formatNimiq } from "./formatters.js";
describe("Client Formatters", () => {
  test("formats wei to NIM string", () => {
    expect(formatNimiq("1000000000000000000")).toBe("1.0000 NIM");
  });
});
