import React from "react";

export function NeonBorder({ children, color = "var(--good)" }) {
  return (
    <div className="neon-border-wrapper" style={{ "--neon-color": color }}>
      {children}
    </div>
  );
}
