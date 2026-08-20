import { isValidWordLength } from "./validation-rules.js";
describe("Validation Rules", () => {
  test("validates word length boundaries", () => {
    expect(isValidWordLength("cat")).toBe(true);
    expect(isValidWordLength("hi")).toBe(false);
  });
});
