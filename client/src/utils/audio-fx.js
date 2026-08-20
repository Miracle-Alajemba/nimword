/**
 * Synthesized Web Audio Sound Effects Utility for WordPot Client
 */

class WebAudioFxSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.5;
  }

  /**
   * Initializes or resumes the AudioContext instance.
   */
  initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Toggles mute status.
   * @returns {boolean} New mute status.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Sets master gain volume level (0.0 to 1.0).
   * @param {number} level
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
  }

  /**
   * Plays a single synthesized frequency tone.
   * @param {number} frequency Frequency in Hz (e.g., 440)
   * @param {number} duration Duration in seconds (e.g., 0.15)
   * @param {OscillatorType} [type="sine"] Oscillator waveform type
   */
  playTone(frequency, duration = 0.15, type = "sine") {
    if (this.isMuted || this.volume <= 0) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (err) {
      console.warn("Audio tone playback failed:", err.message);
    }
  }

  /**
   * Plays success chime sequence for accepted word submission.
   */
  playSuccessChime() {
    this.playTone(523.25, 0.1, "sine"); // C5
    setTimeout(() => this.playTone(659.25, 0.15, "sine"), 80); // E5
  }

  /**
   * Plays error buzzer tone for rejected word submission.
   */
  playErrorBuzzer() {
    this.playTone(180, 0.2, "sawtooth");
  }

  /**
   * Plays combo multiplier chime based on multiplier tier (2x, 3x, 5x).
   * @param {number} multiplier
   */
  playComboChime(multiplier = 2) {
    const baseFreq = 440 * (multiplier >= 5 ? 2.0 : multiplier >= 3 ? 1.5 : 1.25);
    this.playTone(baseFreq, 0.12, "triangle");
    setTimeout(() => this.playTone(baseFreq * 1.2, 0.18, "triangle"), 90);
  }

  /**
   * Plays daily victory fanfare sequence.
   */
  playVictoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.2, "sine"), index * 100);
    });
  }
}

export const audioFx = new WebAudioFxSynthesizer();
export { WebAudioFxSynthesizer };
