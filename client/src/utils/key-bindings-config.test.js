import { KEY_BINDINGS } from "./key-bindings-config.js";
describe("Key Bindings Config", () => {
  test("exports standard key binding strings", () => {
    expect(KEY_BINDINGS.ENTER).toBe("Enter");
  });
});
