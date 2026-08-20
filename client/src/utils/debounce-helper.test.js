import { debounce } from "./debounce-helper.js";
describe("Debounce Helper", () => {
  test("returns debounced function", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });
});
