import { saveThemePreference } from "./theme-storage.js";
describe("Theme Storage", () => {
  test("executes theme persistence without error", () => {
    expect(() => saveThemePreference("light")).not.toThrow();
  });
});
