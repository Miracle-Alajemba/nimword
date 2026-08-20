import React, { useState } from "react";
import { audioFx } from "../../utils/audio-fx.js";

/**
 * Audio Volume Range Slider Component
 * @param {object} props
 * @param {string} [props.className]
 */
export function AudioVolumeSlider({ className = "" }) {
  const [vol, setVol] = useState(audioFx.volume);

  const handleChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVol(newVol);
    audioFx.setVolume(newVol);
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 ${className}`}>
      <span className="text-xs text-slate-400 font-medium">🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={vol}
        onChange={handleChange}
        className="w-20 accent-emerald-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
        aria-label="Volume Slider"
      />
      <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
        {Math.round(vol * 100)}%
      </span>
    </div>
  );
}

export default AudioVolumeSlider;
