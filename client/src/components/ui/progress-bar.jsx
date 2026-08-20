import React from "react";

/**
 * ProgressBar — Animated horizontal progress bar with gradient fill.
 * @param {{ value: number, max?: number, color?: string, height?: number, label?: string, showPercent?: boolean }} props
 */
export function ProgressBar({ value, max = 100, color = "#63f4ca", height = 8, label = "", showPercent = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="progress-bar-wrapper" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label || "Progress"}>
      {label && <span className="progress-bar-label">{label}</span>}
      <div className="progress-bar-track" style={{ height, borderRadius: height / 2 }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: height / 2,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      {showPercent && <span className="progress-bar-percent">{Math.round(pct)}%</span>}
    </div>
  );
}
