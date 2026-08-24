import React from "react";

export function CountdownRing({ secondsLeft, totalSeconds = 60, size = 54, strokeWidth = 4, className = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const color = secondsLeft <= 10 ? "var(--bad)" : secondsLeft <= 20 ? "var(--nq-gold)" : "var(--good)";

  return (
    <div
      className={`countdown-ring ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--surface-sunk)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          color: "var(--ink)",
          fontWeight: "700",
          fontSize: "13px",
          fontFamily: "monospace",
        }}
      >
        {secondsLeft}s
      </span>
    </div>
  );
}
