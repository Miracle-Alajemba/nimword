import test, { describe, it } from "node:test";
import assert from "node:assert";
import { escapeHtml } from "../src/utils/security-helper.js";

describe("Security Helper Module", () => {
  it("should escape HTML tags and dangerous characters", () => {
    const escaped = escapeHtml("<script>alert('xss')</script>");
    assert.strictEqual(escaped, "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
  });
});
