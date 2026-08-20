import { shuffleArray, sampleItem } from "../utils/array.js";

describe("array utils", () => {
  test("shuffleArray preserves length", () => {
    const list = [1, 2, 3, 4, 5];
    expect(shuffleArray(list)).toHaveLength(5);
  });

  test("sampleItem picks an item", () => {
    const list = ["A", "B", "C"];
    expect(list).toContain(sampleItem(list));
  });
});
