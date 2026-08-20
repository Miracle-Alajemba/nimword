import React from "react";

/**
 * TimerRing — SVG ring timer for turn countdowns.
 * @param {{ seconds: number, totalSeconds: number, size?: number }} props
 */
export function TimerRing({ seconds, totalSeconds = 60, size = 54 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, seconds / totalSeconds));
  const strokeDashoffset = circumference * (1 - progress);
  const isLow = seconds <= 10;

  return (
    <div className="timer-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="timer-ring-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="timer-ring-bg"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`timer-ring-bar ${isLow ? "timer-ring-bar--low" : ""}`}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className={`timer-ring-text ${isLow ? "timer-ring-text--low" : ""}`}>
        {seconds}s
      </span>
    </div>
  );
}
