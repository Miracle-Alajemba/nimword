import test from "node:test";
import assert from "node:assert";
import { SOUND_ASSET_PATHS } from "./sound-asset-registry.js";

test("exports audio asset file paths", () => {
  assert.strictEqual(SOUND_ASSET_PATHS.CLICK, "/sounds/click.mp3");
});
