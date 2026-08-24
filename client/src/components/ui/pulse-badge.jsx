import React from "react";

export function PulseBadge({ text, color = "var(--nq-orange)" }) {
  return (
    <span className="pulse-badge" style={{ backgroundColor: `${color}20`, borderColor: color, color }}>
      <span className="pulse-badge-dot" style={{ backgroundColor: color }} />
      {text}
    </span>
  );
}
