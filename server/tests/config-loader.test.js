import test, { describe, it } from "node:test";
import assert from "node:assert";
import { loadServerConfig } from "../src/utils/config-loader.js";

describe("Config Loader Module", () => {
  it("should load default configuration values when env is empty", () => {
    const config = loadServerConfig({});
    assert.strictEqual(config.port, 4000);
    assert.strictEqual(config.nodeEnv, "development");
    assert.strictEqual(config.celoChainId, 42220);
    assert.strictEqual(config.joinPaymentDisplay, "0.01");
  });

  it("should override defaults with provided environment variables", () => {
    const config = loadServerConfig({
      PORT: "5000",
      NODE_ENV: "production",
      DATABASE_SSL: "true",
    });
    assert.strictEqual(config.port, 5000);
    assert.strictEqual(config.nodeEnv, "production");
    assert.strictEqual(config.databaseSsl, true);
  });
});
