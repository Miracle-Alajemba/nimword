import { copyToClipboard } from "./clipboard-helper.js";
describe("Clipboard Helper", () => {
  test("defines copyToClipboard function", () => {
    expect(typeof copyToClipboard).toBe("function");
  });
});
