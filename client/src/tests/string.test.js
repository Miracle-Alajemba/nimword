import { capitalize, slugify } from "../utils/string.js";

describe("string utils", () => {
  test("capitalize capitalizes first letter", () => {
    expect(capitalize("word")).toBe("Word");
  });

  test("slugify creates url friendly string", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});
