import React from "react";

/**
 * Divider — Styled horizontal divider with optional centered label.
 * @param {{ label?: string, color?: string, className?: string }} props
 */
export function Divider({ label = "", color = "rgba(255,255,255,0.08)", className = "" }) {
  if (!label) {
    return <hr className={`divider ${className}`.trim()} style={{ borderColor: color }} />;
  }
  return (
    <div className={`divider-labeled ${className}`.trim()} role="separator">
      <span className="divider-line" style={{ background: color }} />
      <span className="divider-label">{label}</span>
      <span className="divider-line" style={{ background: color }} />
    </div>
  );
}
