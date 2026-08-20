import { buildShareUrl } from "./share-link-builder.js";
describe("Share Link Builder", () => {
  test("constructs room invite URL", () => {
    expect(buildShareUrl("ROOM123")).toContain("room=ROOM123");
  });
});
