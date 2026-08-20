import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("AudioVolumeSlider Component Module", () => {
  it("should export valid component function", async () => {
    const { AudioVolumeSlider } = await import("./audio-volume-slider.jsx");
    assert.strictEqual(typeof AudioVolumeSlider, "function");
  });
});
