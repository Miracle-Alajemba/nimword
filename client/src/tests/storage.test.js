import { getStorageItem, setStorageItem } from "../utils/storage.js";

describe("storage utils", () => {
  test("returns fallback when key not found", () => {
    expect(getStorageItem("nonexistent_key", "default")).toBe("default");
  });
});
