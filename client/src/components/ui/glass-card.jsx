import React from "react";

/**
 * GlassCard — Frosted glass container with blur backdrop and subtle border.
 * @param {{ children: React.ReactNode, className?: string, glow?: boolean, padding?: string }} props
 */
export function GlassCard({ children, className = "", glow = false, padding = "1.25rem" }) {
  return (
    <div
      className={`glass-card ${glow ? "glass-card--glow" : ""} ${className}`.trim()}
      style={{ padding }}
    >
      {children}
    </div>
  );
}
