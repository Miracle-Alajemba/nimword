import React from "react";

/**
 * PulseDot — Animated live status indicator with configurable color.
 * @param {{ color?: string, size?: number, label?: string }} props
 */
export function PulseDot({ color = "#63f4ca", size = 10, label = "Live" }) {
  const dotStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 0 0 ${color}`,
    animation: "pulse-dot-ring 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    flexShrink: 0,
  };

  return (
    <span
      className="pulse-dot-wrapper"
      role="status"
      aria-label={label}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span style={dotStyle} />
      {label && (
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </span>
      )}
    </span>
  );
}
