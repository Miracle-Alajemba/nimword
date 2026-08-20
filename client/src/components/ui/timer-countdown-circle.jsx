import React from "react";

/**
 * Animated SVG Countdown Ring Timer Component
 * @param {object} props
 * @param {number} props.secondsLeft
 * @param {number} [props.totalSeconds=60]
 * @param {number} [props.size=48]
 */
export function TimerCountdownCircle({ secondsLeft, totalSeconds = 60, size = 48 }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const dashoffset = circumference * (1 - progress);

  const colorClass =
    progress < 0.25 ? "stroke-red-500" : progress < 0.5 ? "stroke-amber-500" : "stroke-emerald-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-800 fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          className={`fill-none transition-all duration-300 ${colorClass}`}
        />
      </svg>
      <span className="absolute font-extrabold text-xs text-slate-100 font-mono">
        {Math.max(0, secondsLeft)}
      </span>
    </div>
  );
}

export default TimerCountdownCircle;
