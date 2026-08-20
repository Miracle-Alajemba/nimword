import React from "react";

/**
 * VolumeSlider — Audio volume slider with percentage readout.
 * @param {{ volume: number, onChange: (val: number) => void }} props
 */
export function VolumeSlider({ volume, onChange }) {
  return (
    <div className="volume-slider-wrapper">
      <span className="volume-icon" aria-hidden="true">🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="volume-slider-input"
        aria-label="Volume level"
      />
      <span className="volume-readout">{Math.round(volume * 100)}%</span>
    </div>
  );
}
