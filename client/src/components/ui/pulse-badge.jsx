import React from "react";

export function PulseBadge({ text, color = "#ffad33" }) {
  return (
    <span className="pulse-badge" style={{ backgroundColor: `${color}20`, borderColor: color, color }}>
      <span className="pulse-badge-dot" style={{ backgroundColor: color }} />
      {text}
    </span>
  );
}
