import React from "react";

/**
 * AudioToggle — Mute/unmute sound toggle button.
 * @param {{ isMuted: boolean, onToggle: () => void }} props
 */
export function AudioToggle({ isMuted, onToggle }) {
  return (
    <button
      type="button"
      className={`audio-toggle ${isMuted ? "audio-toggle--muted" : ""}`}
      onClick={onToggle}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      <span className="audio-toggle-icon">{isMuted ? "🔇" : "🔊"}</span>
    </button>
  );
}
