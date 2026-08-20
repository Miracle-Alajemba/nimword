import React from "react";

/**
 * Spinner — Animated loading spinner with configurable size and color.
 * @param {{ size?: number, color?: string, thickness?: number, label?: string }} props
 */
export function Spinner({ size = 24, color = "#63f4ca", thickness = 3, label = "Loading" }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "spinner-rotate 0.8s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r={10}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={thickness}
        />
        <circle
          cx="12"
          cy="12"
          r={10}
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
          style={{ animation: "spinner-dash 1.2s ease-in-out infinite" }}
        />
      </svg>
    </span>
  );
}
