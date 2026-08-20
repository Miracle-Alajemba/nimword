import test from "node:test";
import assert from "node:assert";
import { anonymizeIp } from "../src/utils/ip-anonymizer.js";

test("anonymizes last two octets of IPv4", () => {
  assert.strictEqual(anonymizeIp("192.168.1.50"), "192.168.0.0");
});
