import test, { describe, it } from "node:test";
import assert from "node:assert";
import { WebAudioFxSynthesizer } from "./audio-fx.js";

describe("WebAudioFxSynthesizer Module", () => {
  it("should initialize default mute and volume state", () => {
    const synth = new WebAudioFxSynthesizer();
    assert.strictEqual(synth.isMuted, false);
    assert.strictEqual(synth.volume, 0.5);
  });

  it("should toggle mute status correctly", () => {
    const synth = new WebAudioFxSynthesizer();
    const muted = synth.toggleMute();
    assert.strictEqual(muted, true);
    assert.strictEqual(synth.isMuted, true);
  });

  it("should clamp volume between 0 and 1", () => {
    const synth = new WebAudioFxSynthesizer();
    synth.setVolume(1.5);
    assert.strictEqual(synth.volume, 1);
    synth.setVolume(-0.5);
    assert.strictEqual(synth.volume, 0);
  });
});
