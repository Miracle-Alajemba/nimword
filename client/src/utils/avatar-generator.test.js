import { getAvatarUrl } from "./avatar-generator.js";
describe("Avatar Generator", () => {
  test("returns valid avatar URL", () => {
    expect(getAvatarUrl("Alice")).toContain("seed=Alice");
  });
});
