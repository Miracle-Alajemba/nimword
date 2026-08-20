import { getStorageItem } from "./local-storage-helper.js";
describe("LocalStorage Helper", () => {
  test("returns fallback when key is missing", () => {
    expect(getStorageItem("non_existent_key", "default")).toBe("default");
  });
});
