import React from "react";

export function SpeedMeter({ wordsPerMinute = 0 }) {
  return (
    <div className="speed-meter">
      <span className="speed-meter-val">{wordsPerMinute}</span>
      <span className="speed-meter-lbl">WPM</span>
    </div>
  );
}
