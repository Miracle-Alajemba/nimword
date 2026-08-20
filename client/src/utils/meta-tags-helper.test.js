import { updatePageTitle } from "./meta-tags-helper.js";
describe("Meta Tags Helper", () => {
  test("executes title updater safely", () => {
    expect(() => updatePageTitle("Test Title")).not.toThrow();
  });
});
