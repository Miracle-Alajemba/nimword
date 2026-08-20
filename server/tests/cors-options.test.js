import test from "node:test";
import assert from "node:assert/strict";
import { isOriginAllowed, getCorsOptions } from "../src/utils/cors-options.js";

test("isOriginAllowed allows production domain and localhost", () => {
  assert.equal(isOriginAllowed("https://wordpot.vercel.app"), true);
  assert.equal(isOriginAllowed("http://localhost:5173"), true);
  assert.equal(isOriginAllowed(null), true);
});

test("isOriginAllowed blocks unauthorized origins", () => {
  assert.equal(isOriginAllowed("https://malicious-site.com"), false);
  assert.equal(isOriginAllowed("http://phishing.net"), false);
});

test("getCorsOptions returns correct methods and headers", () => {
  const options = getCorsOptions();
  assert.equal(options.credentials, true);
  assert.deepEqual(options.methods, ["GET", "POST", "OPTIONS"]);
});
