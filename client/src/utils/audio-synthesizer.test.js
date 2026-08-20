import { playBeep } from "./audio-synthesizer.js";
describe("Audio Synthesizer", () => {
  test("safely executes playBeep without crashing", () => {
    expect(() => playBeep(440, 0.1)).not.toThrow();
  });
});
