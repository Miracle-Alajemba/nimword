import React, { useState } from "react";
import { audioFx } from "../../utils/audio-fx.js";

/**
 * Accessible Sound Mute/Unmute Toggle Button Component
 * @param {object} props
 * @param {string} [props.className]
 */
export function SoundIndicator({ className = "" }) {
  const [muted, setMuted] = useState(audioFx.isMuted);

  const handleToggle = () => {
    const isNowMuted = audioFx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      audioFx.playSuccessChime();
    }
  };

  return (
    <button
      type="button"
      id="sound-indicator-toggle-btn"
      onClick={handleToggle}
      aria-label={muted ? "Unmute audio sound effects" : "Mute audio sound effects"}
      className={`sound-indicator-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
        muted
          ? "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80"
          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
      } ${className}`}
    >
      <span className="text-sm">{muted ? "🔇" : "🔊"}</span>
      <span>{muted ? "Muted" : "Sound On"}</span>
    </button>
  );
}

export default SoundIndicator;
